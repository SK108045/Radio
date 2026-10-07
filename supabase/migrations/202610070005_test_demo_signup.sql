BEGIN;
-- Extend the existing demo flag only to the explicitly registered test identity.
ALTER TABLE public.sales_artist_registry DROP CONSTRAINT sales_artist_registry_check;
ALTER TABLE public.sales_artist_registry ADD CONSTRAINT sales_artist_registry_check
 CHECK(NOT demo_signup_enabled OR slug='metro_stunna' OR (slug='test_artist' AND is_test));
CREATE FUNCTION public.sales_claim_test_demo(p_phone text,p_password_hash text) RETURNS uuid
LANGUAGE plpgsql SET search_path=public AS $$
DECLARE a sales_artist_registry;
BEGIN
 SELECT * INTO a FROM sales_artist_registry WHERE slug='test_artist' AND is_test FOR UPDATE;
 IF NOT FOUND OR NOT a.demo_signup_enabled OR a.claimed_at IS NOT NULL THEN
  RAISE EXCEPTION 'Test signup is unavailable';
 END IF;
 INSERT INTO sales_artist_accounts(artist_id,phone,password_hash) VALUES(a.artist_id,p_phone,p_password_hash);
 UPDATE sales_artist_registry SET claimed_at=now(),demo_signup_enabled=false WHERE artist_id=a.artist_id;
 RETURN a.artist_id;
END $$;
REVOKE ALL ON FUNCTION public.sales_claim_test_demo(text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.sales_claim_test_demo(text,text) TO service_role;
UPDATE public.sales_artist_registry SET demo_signup_enabled=true WHERE slug='test_artist' AND is_test AND claimed_at IS NULL;
COMMIT;
