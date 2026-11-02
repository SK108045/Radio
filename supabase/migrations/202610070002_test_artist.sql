BEGIN;
-- One explicitly requested experiment account, separate from the three public artists.
ALTER TABLE public.sales_artist_registry ADD COLUMN is_test boolean NOT NULL DEFAULT false;
ALTER TABLE public.sales_artist_registry DROP CONSTRAINT sales_artist_registry_slug_check;
ALTER TABLE public.sales_artist_registry DROP CONSTRAINT sales_artist_registry_check;
ALTER TABLE public.sales_artist_registry ADD CONSTRAINT sales_artist_registry_identity_check CHECK (
 (NOT is_test AND (
  (slug='metro_stunna' AND stage_name='Metro_Stunna') OR
  (slug='swatt' AND stage_name='swatt') OR
  (slug='kapitani' AND stage_name='Kapitani')
 )) OR (is_test AND slug='test_artist' AND stage_name='Test_Artist')
);
INSERT INTO public.artists(id,stage_name,user_id)
VALUES('33333333-3333-3333-3333-333333333337','Test_Artist',null);
INSERT INTO public.sales_artist_registry(artist_id,slug,stage_name,is_test)
VALUES('33333333-3333-3333-3333-333333333337','test_artist','Test_Artist',true);
COMMIT;
