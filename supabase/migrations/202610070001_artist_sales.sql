BEGIN;
-- Existing artists and tracks are preserved. Only the three registered artists can claim accounts.
INSERT INTO public.artists (id, stage_name, user_id) VALUES
 ('33333333-3333-3333-3333-333333333332','swatt',null),
 ('33333333-3333-3333-3333-333333333333','Metro_Stunna',null),
 ('33333333-3333-3333-3333-333333333336','Kapitani',null)
ON CONFLICT (id) DO NOTHING;
CREATE TABLE public.sales_artist_registry (
 artist_id uuid PRIMARY KEY REFERENCES public.artists(id),
 slug text UNIQUE NOT NULL CHECK(slug IN ('metro_stunna','swatt','kapitani')),
 stage_name text NOT NULL,
 claimed_at timestamptz,
 CHECK ((slug='metro_stunna' AND stage_name='Metro_Stunna') OR (slug='swatt' AND stage_name='swatt') OR (slug='kapitani' AND stage_name='Kapitani'))
);
INSERT INTO public.sales_artist_registry(artist_id,slug,stage_name) VALUES
 ('33333333-3333-3333-3333-333333333332','swatt','swatt'),
 ('33333333-3333-3333-3333-333333333333','metro_stunna','Metro_Stunna'),
 ('33333333-3333-3333-3333-333333333336','kapitani','Kapitani');
CREATE TABLE public.sales_artist_accounts (
 artist_id uuid PRIMARY KEY REFERENCES public.sales_artist_registry(artist_id),
 phone text UNIQUE NOT NULL CHECK(phone ~ '^0[17][0-9]{8}$'),
 password_hash text NOT NULL CHECK(password_hash ~ '^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$'),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.sales_artist_sessions (
 token_hash text PRIMARY KEY, artist_id uuid NOT NULL REFERENCES public.sales_artist_accounts(artist_id), expires_at timestamptz NOT NULL
);
CREATE TABLE public.sales_otp_challenges (
 id uuid PRIMARY KEY, artist_id uuid NOT NULL REFERENCES public.sales_artist_registry(artist_id),
 phone text NOT NULL, purpose text NOT NULL CHECK(purpose IN ('signup','phone-change')),
 code_hash text NOT NULL, attempts integer NOT NULL DEFAULT 0, expires_at timestamptz NOT NULL,
 verified_at timestamptz, consumed_at timestamptz
);
CREATE TABLE public.sales_rate_limits (key text PRIMARY KEY, hits integer NOT NULL, resets_at timestamptz NOT NULL);
CREATE FUNCTION public.sales_rate_limit(p_key text,p_max integer,p_seconds integer) RETURNS boolean
LANGUAGE plpgsql SET search_path = public AS $$
DECLARE n integer;
BEGIN
 INSERT INTO sales_rate_limits(key,hits,resets_at) VALUES(p_key,1,now()+make_interval(secs=>p_seconds))
 ON CONFLICT(key) DO UPDATE SET hits=CASE WHEN sales_rate_limits.resets_at<=now() THEN 1 ELSE sales_rate_limits.hits+1 END,
 resets_at=CASE WHEN sales_rate_limits.resets_at<=now() THEN now()+make_interval(secs=>p_seconds) ELSE sales_rate_limits.resets_at END
 RETURNING hits INTO n;
 RETURN n<=p_max;
END $$;
-- Verification attempts are counted under a row lock, including incorrect guesses.
CREATE FUNCTION public.sales_verify_otp(p_id uuid,p_hash text,p_artist uuid,p_purpose text) RETURNS boolean
LANGUAGE plpgsql SET search_path = public AS $$
DECLARE c sales_otp_challenges;
BEGIN
 SELECT * INTO c FROM sales_otp_challenges WHERE id=p_id FOR UPDATE;
 IF NOT FOUND OR c.artist_id<>p_artist OR c.purpose<>p_purpose OR c.consumed_at IS NOT NULL OR c.expires_at<=now() OR c.attempts>=5 THEN RETURN false; END IF;
 UPDATE sales_otp_challenges SET attempts=attempts+1 WHERE id=p_id;
 IF c.code_hash<>p_hash THEN RETURN false; END IF;
 UPDATE sales_otp_challenges SET verified_at=now() WHERE id=p_id;
 RETURN true;
END $$;
CREATE FUNCTION public.sales_claim_artist(p_slug text,p_challenge uuid,p_password_hash text) RETURNS uuid
LANGUAGE plpgsql SET search_path = public AS $$
DECLARE a sales_artist_registry; c sales_otp_challenges;
BEGIN
 SELECT * INTO a FROM sales_artist_registry WHERE slug=p_slug FOR UPDATE;
 IF NOT FOUND OR a.claimed_at IS NOT NULL THEN RAISE EXCEPTION 'Signup link is unavailable'; END IF;
 SELECT * INTO c FROM sales_otp_challenges WHERE id=p_challenge FOR UPDATE;
 IF NOT FOUND OR c.artist_id<>a.artist_id OR c.purpose<>'signup' OR c.verified_at IS NULL OR c.consumed_at IS NOT NULL OR c.expires_at<=now() THEN RAISE EXCEPTION 'Phone verification required'; END IF;
 INSERT INTO sales_artist_accounts(artist_id,phone,password_hash) VALUES(a.artist_id,c.phone,p_password_hash);
 UPDATE sales_otp_challenges SET consumed_at=now() WHERE id=c.id;
 UPDATE sales_artist_registry SET claimed_at=now() WHERE artist_id=a.artist_id;
 RETURN a.artist_id;
END $$;
CREATE FUNCTION public.sales_change_phone(p_artist uuid,p_challenge uuid) RETURNS boolean
LANGUAGE plpgsql SET search_path = public AS $$
DECLARE c sales_otp_challenges;
BEGIN
 SELECT * INTO c FROM sales_otp_challenges WHERE id=p_challenge FOR UPDATE;
 IF NOT FOUND OR c.artist_id<>p_artist OR c.purpose<>'phone-change' OR c.verified_at IS NULL OR c.consumed_at IS NOT NULL OR c.expires_at<=now() THEN RAISE EXCEPTION 'Phone verification required'; END IF;
 UPDATE sales_artist_accounts SET phone=c.phone WHERE artist_id=p_artist;
 UPDATE sales_otp_challenges SET consumed_at=now() WHERE id=c.id;
 DELETE FROM sales_artist_sessions WHERE artist_id=p_artist;
 RETURN true;
END $$;
CREATE FUNCTION public.sales_change_password(p_artist uuid,p_hash text) RETURNS boolean
LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 UPDATE sales_artist_accounts SET password_hash=p_hash WHERE artist_id=p_artist;
 IF NOT FOUND THEN RAISE EXCEPTION 'Artist not found'; END IF;
 DELETE FROM sales_artist_sessions WHERE artist_id=p_artist;
 RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.sales_change_password(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.sales_change_password(uuid,text) TO service_role;
ALTER TABLE public.tracks ADD COLUMN sales_status text NOT NULL DEFAULT 'draft' CHECK(sales_status IN ('draft','ready','archived'));
ALTER TABLE public.tracks ADD COLUMN preview_file_path text;
ALTER TABLE public.tracks ADD COLUMN audio_content_type text;
ALTER TABLE public.tracks ADD COLUMN audio_size bigint;
-- Convert any existing public bucket URLs to object keys; originals become private below.
UPDATE public.tracks SET mp3_file_path=split_part(mp3_file_path,'/object/public/artist-tracks/',2) WHERE mp3_file_path LIKE '%/object/public/artist-tracks/%';
CREATE FUNCTION public.sales_immutable_track_owner() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN IF NEW.artist_id IS DISTINCT FROM OLD.artist_id THEN RAISE EXCEPTION 'Track artist cannot change'; END IF; RETURN NEW; END $$;
CREATE TRIGGER sales_track_owner BEFORE UPDATE ON public.tracks FOR EACH ROW EXECUTE FUNCTION public.sales_immutable_track_owner();
CREATE FUNCTION public.sales_immutable_identity() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN IF NEW.artist_id IS DISTINCT FROM OLD.artist_id THEN RAISE EXCEPTION 'Artist identity cannot change'; END IF; RETURN NEW; END $$;
CREATE TRIGGER sales_account_identity BEFORE UPDATE ON public.sales_artist_accounts FOR EACH ROW EXECUTE FUNCTION public.sales_immutable_identity();
CREATE TABLE public.sales_orders (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), browser_hash text NOT NULL, attempt_id uuid NOT NULL,
 artist_id uuid NOT NULL REFERENCES public.sales_artist_registry(artist_id), track_id uuid NOT NULL REFERENCES public.tracks(id),
 amount numeric(12,2) NOT NULL CHECK(amount>0), reference text UNIQUE NOT NULL,
 provider_id text UNIQUE, status text NOT NULL DEFAULT 'created' CHECK(status IN ('created','pending','uncertain','failed','paid')),
 last_checked_at timestamptz, note text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now(), confirmed_at timestamptz,
 UNIQUE(browser_hash,attempt_id), UNIQUE(id,artist_id,track_id,amount)
);
CREATE UNIQUE INDEX sales_one_open_order ON public.sales_orders(browser_hash,track_id) WHERE status IN ('created','pending','uncertain');
CREATE INDEX sales_orders_reconcile ON public.sales_orders(created_at) WHERE status IN ('created','pending','uncertain');
CREATE TABLE public.sales_callback_inbox (
 provider_id text PRIMARY KEY, received_at timestamptz NOT NULL DEFAULT now(), last_checked_at timestamptz, processed_at timestamptz
);
CREATE INDEX sales_callback_unprocessed ON public.sales_callback_inbox(last_checked_at NULLS FIRST) WHERE processed_at IS NULL;
CREATE TABLE public.sales_receipts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id uuid UNIQUE NOT NULL,
 artist_id uuid NOT NULL, track_id uuid NOT NULL, amount numeric(12,2) NOT NULL,
 reference text UNIQUE NOT NULL, provider_id text UNIQUE NOT NULL, transaction_id text UNIQUE NOT NULL,
 confirmed_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(order_id,artist_id,track_id,amount) REFERENCES public.sales_orders(id,artist_id,track_id,amount)
);
CREATE INDEX sales_receipts_artist_time ON public.sales_receipts(artist_id,confirmed_at DESC);
CREATE TABLE public.sales_entitlements (
 order_id uuid PRIMARY KEY REFERENCES public.sales_receipts(order_id), browser_hash text NOT NULL,
 track_id uuid NOT NULL REFERENCES public.tracks(id), expires_at timestamptz NOT NULL
);
CREATE INDEX sales_entitlements_browser ON public.sales_entitlements(browser_hash,track_id,expires_at);
CREATE FUNCTION public.sales_create_order(p_browser text,p_track uuid,p_attempt uuid) RETURNS public.sales_orders
LANGUAGE plpgsql SET search_path=public AS $$
DECLARE o sales_orders; t tracks;
BEGIN
 -- Serialize competing checkout clicks, including across instances.
 PERFORM pg_advisory_xact_lock(hashtextextended(p_browser||p_track::text,0));
 SELECT * INTO o FROM sales_orders WHERE browser_hash=p_browser AND attempt_id=p_attempt;
 IF FOUND THEN IF o.track_id<>p_track THEN RAISE EXCEPTION 'Attempt belongs to another track'; END IF; RETURN o; END IF;
 SELECT * INTO o FROM sales_orders WHERE browser_hash=p_browser AND track_id=p_track AND status IN ('created','pending','uncertain');
 IF FOUND THEN RETURN o; END IF;
 SELECT t0.* INTO t FROM tracks t0 JOIN sales_artist_registry a ON a.artist_id=t0.artist_id WHERE t0.id=p_track AND t0.sales_status='ready' FOR SHARE OF t0;
 IF NOT FOUND OR t.price_ksh<=0 OR t.preview_file_path IS NULL THEN RAISE EXCEPTION 'Track is not for sale'; END IF;
 INSERT INTO sales_orders(browser_hash,attempt_id,artist_id,track_id,amount,reference)
 VALUES(p_browser,p_attempt,t.artist_id,p_track,t.price_ksh,'RIENG-TRACK-'||gen_random_uuid()::text) RETURNING * INTO o;
 RETURN o;
END $$;
-- One transaction records accounting AND the entitlement. Any constraint failure rolls everything back.
CREATE FUNCTION public.sales_confirm_order(p_order uuid,p_provider text,p_receipt text,p_amount numeric) RETURNS public.sales_orders
LANGUAGE plpgsql SET search_path=public AS $$
DECLARE o sales_orders; paid_at timestamptz;
BEGIN
 SELECT * INTO o FROM sales_orders WHERE id=p_order FOR UPDATE;
 IF NOT FOUND OR o.provider_id IS DISTINCT FROM p_provider OR o.amount<>p_amount OR p_receipt !~ '^[A-Z0-9]{8,30}$' THEN RAISE EXCEPTION 'Payment does not match checkout'; END IF;
 IF o.status='paid' THEN
  IF NOT EXISTS(SELECT 1 FROM sales_receipts WHERE order_id=o.id AND transaction_id=p_receipt) THEN RAISE EXCEPTION 'Receipt mismatch'; END IF;
  RETURN o;
 END IF;
 paid_at:=clock_timestamp();
 INSERT INTO sales_receipts(order_id,artist_id,track_id,amount,reference,provider_id,transaction_id,confirmed_at)
 VALUES(o.id,o.artist_id,o.track_id,o.amount,o.reference,p_provider,p_receipt,paid_at);
 INSERT INTO sales_entitlements(order_id,browser_hash,track_id,expires_at) VALUES(o.id,o.browser_hash,o.track_id,paid_at+interval '12 hours');
 UPDATE sales_orders SET status='paid',confirmed_at=paid_at,note='Payment confirmed. Listening is unlocked for 12 hours.' WHERE id=o.id RETURNING * INTO o;
 RETURN o;
END $$;
-- The legacy password column is removed, never copied to the new accounts.
ALTER TABLE IF EXISTS public.artist_accounts DROP COLUMN IF EXISTS password;
-- Server-only access: anonymous clients cannot bypass portal ownership or payment checks.
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['artists','tracks','artist_accounts','track_performance','sales_artist_registry','sales_artist_accounts','sales_artist_sessions','sales_otp_challenges','sales_rate_limits','sales_orders','sales_callback_inbox','sales_receipts','sales_entitlements'] LOOP
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated',t);
  EXECUTE format('GRANT ALL ON public.%I TO service_role',t);
 END LOOP;
END $$;
REVOKE ALL ON FUNCTION public.sales_rate_limit(text,integer,integer),public.sales_verify_otp(uuid,text,uuid,text),public.sales_claim_artist(text,uuid,text),public.sales_change_phone(uuid,uuid),public.sales_create_order(text,uuid,uuid),public.sales_confirm_order(uuid,text,text,numeric) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.sales_rate_limit(text,integer,integer),public.sales_verify_otp(uuid,text,uuid,text),public.sales_claim_artist(text,uuid,text),public.sales_change_phone(uuid,uuid),public.sales_create_order(text,uuid,uuid),public.sales_confirm_order(uuid,text,text,numeric) TO service_role;
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types) VALUES
 ('artist-tracks','artist-tracks',false,52428800,ARRAY['audio/mpeg','audio/mp3','audio/wav','audio/x-wav','audio/mp4','audio/aac','audio/ogg','application/octet-stream']),
 ('artist-previews','artist-previews',false,2097152,ARRAY['audio/mpeg'])
ON CONFLICT(id) DO UPDATE SET public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
REVOKE ALL ON public.vw_top_performing_tracks FROM anon, authenticated;
GRANT SELECT ON public.vw_top_performing_tracks TO service_role;
-- Restrictive policies deny old permissive/dev policies without affecting other buckets.
CREATE POLICY sales_private_audio_select ON storage.objects AS RESTRICTIVE FOR SELECT TO anon,authenticated USING(bucket_id NOT IN ('artist-tracks','artist-previews'));
CREATE POLICY sales_private_audio_insert ON storage.objects AS RESTRICTIVE FOR INSERT TO anon,authenticated WITH CHECK(bucket_id NOT IN ('artist-tracks','artist-previews'));
CREATE POLICY sales_private_audio_update ON storage.objects AS RESTRICTIVE FOR UPDATE TO anon,authenticated USING(bucket_id NOT IN ('artist-tracks','artist-previews')) WITH CHECK(bucket_id NOT IN ('artist-tracks','artist-previews'));
CREATE POLICY sales_private_audio_delete ON storage.objects AS RESTRICTIVE FOR DELETE TO anon,authenticated USING(bucket_id NOT IN ('artist-tracks','artist-previews'));
COMMIT;
