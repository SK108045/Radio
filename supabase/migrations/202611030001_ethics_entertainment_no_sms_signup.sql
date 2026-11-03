BEGIN;
-- Register Ethics Entertainment in the artist sales portal and allow a one-time
-- phone + password claim without SMS verification. Normal phone changes still use OTP.

ALTER TABLE public.sales_artist_registry DROP CONSTRAINT IF EXISTS sales_artist_registry_identity_check;
ALTER TABLE public.sales_artist_registry ADD CONSTRAINT sales_artist_registry_identity_check CHECK (
 (NOT is_test AND (
  (slug='metro_stunna' AND stage_name='Metro_Stunna') OR
  (slug='swatt' AND stage_name='swatt') OR
  (slug='kapitani' AND stage_name='Kapitani') OR
  (slug='ethics_entertainment' AND stage_name='Ethics Entertainment')
 )) OR (is_test AND slug='test_artist' AND stage_name='Test_Artist')
);

ALTER TABLE public.sales_artist_registry DROP CONSTRAINT IF EXISTS sales_artist_registry_check;
ALTER TABLE public.sales_artist_registry ADD CONSTRAINT sales_artist_registry_check
 CHECK(
  NOT demo_signup_enabled
  OR slug IN ('metro_stunna','swatt','kapitani','ethics_entertainment')
  OR (slug='test_artist' AND is_test)
 );

DO $$
DECLARE ethics_artist_id uuid;
BEGIN
 SELECT id INTO ethics_artist_id
 FROM public.artists
 WHERE stage_name='Ethics Entertainment'
 LIMIT 1;

 IF ethics_artist_id IS NULL THEN
  ethics_artist_id := gen_random_uuid();
  INSERT INTO public.artists(id,stage_name,user_id)
  VALUES(ethics_artist_id,'Ethics Entertainment',null);
 END IF;

 IF NOT EXISTS (SELECT 1 FROM public.sales_artist_registry WHERE slug='ethics_entertainment') THEN
  INSERT INTO public.sales_artist_registry(artist_id,slug,stage_name,is_test,demo_signup_enabled)
  VALUES(ethics_artist_id,'ethics_entertainment','Ethics Entertainment',false,true);
 END IF;
END $$;

CREATE OR REPLACE FUNCTION public.sales_claim_ethics_entertainment_no_sms(p_phone text,p_password_hash text) RETURNS uuid
LANGUAGE plpgsql SET search_path=public AS $$
DECLARE a sales_artist_registry;
BEGIN
 SELECT * INTO a FROM sales_artist_registry WHERE slug='ethics_entertainment' FOR UPDATE;
 IF NOT FOUND OR NOT a.demo_signup_enabled OR a.claimed_at IS NOT NULL THEN
  RAISE EXCEPTION 'Ethics Entertainment signup is unavailable';
 END IF;

 INSERT INTO sales_artist_accounts(artist_id,phone,password_hash)
 VALUES(a.artist_id,p_phone,p_password_hash);

 UPDATE sales_artist_registry
 SET claimed_at=now(),demo_signup_enabled=false
 WHERE artist_id=a.artist_id;

 RETURN a.artist_id;
END $$;

REVOKE ALL ON FUNCTION public.sales_claim_ethics_entertainment_no_sms(text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.sales_claim_ethics_entertainment_no_sms(text,text) TO service_role;

UPDATE public.sales_artist_registry
SET demo_signup_enabled=true
WHERE slug='ethics_entertainment' AND claimed_at IS NULL;

COMMIT;
