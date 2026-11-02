BEGIN;
-- Allow the existing Kapitani identity to claim its account without a Sozuri OTP.
-- The account remains a one-time claim and still requires a unique Kenyan phone and password.
ALTER TABLE public.sales_artist_registry DROP CONSTRAINT IF EXISTS sales_artist_registry_check;
ALTER TABLE public.sales_artist_registry ADD CONSTRAINT sales_artist_registry_check
 CHECK(NOT demo_signup_enabled OR slug IN ('metro_stunna','swatt','kapitani') OR (slug='test_artist' AND is_test));

CREATE OR REPLACE FUNCTION public.sales_claim_kapitani_no_sms(p_phone text,p_password_hash text) RETURNS uuid
LANGUAGE plpgsql SET search_path=public AS $$
DECLARE a sales_artist_registry;
BEGIN
 SELECT * INTO a FROM sales_artist_registry WHERE slug='kapitani' FOR UPDATE;
 IF NOT FOUND OR NOT a.demo_signup_enabled OR a.claimed_at IS NOT NULL THEN
  RAISE EXCEPTION 'Kapitani signup is unavailable';
 END IF;
 INSERT INTO sales_artist_accounts(artist_id,phone,password_hash) VALUES(a.artist_id,p_phone,p_password_hash);
 UPDATE sales_artist_registry SET claimed_at=now(),demo_signup_enabled=false WHERE artist_id=a.artist_id;
 RETURN a.artist_id;
END $$;
REVOKE ALL ON FUNCTION public.sales_claim_kapitani_no_sms(text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.sales_claim_kapitani_no_sms(text,text) TO service_role;
-- Enable only if Kapitani has not already claimed the artist identity.
UPDATE public.sales_artist_registry SET demo_signup_enabled=true WHERE slug='kapitani' AND claimed_at IS NULL;
COMMIT;
