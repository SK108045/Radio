BEGIN;
-- Temporary demo exception, restricted to Metro_Stunna and switched off on claim.
ALTER TABLE public.sales_artist_registry ADD COLUMN demo_signup_enabled boolean NOT NULL DEFAULT false
 CHECK(NOT demo_signup_enabled OR slug='metro_stunna');
CREATE FUNCTION public.sales_claim_metro_demo(p_phone text,p_password_hash text) RETURNS uuid
LANGUAGE plpgsql SET search_path=public AS $$
DECLARE a sales_artist_registry;
BEGIN
 SELECT * INTO a FROM sales_artist_registry WHERE slug='metro_stunna' FOR UPDATE;
 IF NOT FOUND OR NOT a.demo_signup_enabled OR a.claimed_at IS NOT NULL THEN
  RAISE EXCEPTION 'Demo signup is unavailable';
 END IF;
 INSERT INTO sales_artist_accounts(artist_id,phone,password_hash) VALUES(a.artist_id,p_phone,p_password_hash);
 UPDATE sales_artist_registry SET claimed_at=now(),demo_signup_enabled=false WHERE artist_id=a.artist_id;
 RETURN a.artist_id;
END $$;
REVOKE ALL ON FUNCTION public.sales_claim_metro_demo(text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.sales_claim_metro_demo(text,text) TO service_role;
UPDATE public.sales_artist_registry SET demo_signup_enabled=true WHERE slug='metro_stunna' AND claimed_at IS NULL;
COMMIT;
