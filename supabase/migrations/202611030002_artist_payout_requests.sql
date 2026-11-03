BEGIN;

CREATE TABLE IF NOT EXISTS public.sales_artist_payout_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid NOT NULL REFERENCES public.sales_artist_registry(artist_id),
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','paid','cancelled')),
  requested_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

CREATE INDEX IF NOT EXISTS sales_artist_payout_requests_artist_time
  ON public.sales_artist_payout_requests(artist_id, requested_at DESC);

ALTER TABLE public.sales_artist_payout_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.sales_artist_payout_requests FROM anon, authenticated;
GRANT ALL ON public.sales_artist_payout_requests TO service_role;

CREATE OR REPLACE FUNCTION public.sales_request_artist_payout(p_artist uuid) RETURNS uuid
LANGUAGE plpgsql
SET search_path=public
AS $$
DECLARE
  gross numeric(12,2);
  earned numeric(12,2);
  reserved numeric(12,2);
  available numeric(12,2);
  request_id uuid;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_artist::text, 0));

  IF EXISTS (
    SELECT 1 FROM sales_artist_payout_requests
    WHERE artist_id=p_artist AND status='requested'
  ) THEN
    RAISE EXCEPTION 'A payout request is already pending.';
  END IF;

  SELECT COALESCE(SUM(amount),0)::numeric(12,2)
  INTO gross
  FROM sales_receipts
  WHERE artist_id=p_artist;

  earned := ROUND(gross * 0.80, 2);

  SELECT COALESCE(SUM(amount),0)::numeric(12,2)
  INTO reserved
  FROM sales_artist_payout_requests
  WHERE artist_id=p_artist AND status IN ('requested','paid');

  available := ROUND(earned - reserved, 2);

  IF available <= 0 THEN
    RAISE EXCEPTION 'No available earnings to request.';
  END IF;

  INSERT INTO sales_artist_payout_requests(artist_id, amount)
  VALUES(p_artist, available)
  RETURNING id INTO request_id;

  RETURN request_id;
END $$;

REVOKE ALL ON FUNCTION public.sales_request_artist_payout(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sales_request_artist_payout(uuid) TO service_role;

COMMIT;
