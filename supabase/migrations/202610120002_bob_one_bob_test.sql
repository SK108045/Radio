BEGIN;

-- Run in the Supabase SQL Editor after the original BoB pre-order SQL.
-- Test payments are real KSh 1 charges, but never count as a KSh 150 pre-order.
ALTER TABLE public.bob_preorders
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;

ALTER TABLE public.bob_preorders
  DROP CONSTRAINT IF EXISTS bob_preorders_amount_check;
ALTER TABLE public.bob_preorders
  DROP CONSTRAINT IF EXISTS bob_preorders_tier_amount_check;
ALTER TABLE public.bob_preorders
  ADD CONSTRAINT bob_preorders_tier_amount_check
  CHECK ((is_test = true AND amount = 1)
      OR (is_test = false AND amount = 150));

-- Separate active test and live checkouts in the same browser.
DROP INDEX IF EXISTS public.bob_one_active_browser_order;
CREATE UNIQUE INDEX bob_one_active_browser_order
  ON public.bob_preorders (browser_hash, is_test)
  WHERE status IN ('created','uncertain','pending','paid');

CREATE OR REPLACE FUNCTION public.bob_create_test_preorder(
  p_browser text, p_attempt uuid, p_phone text
)
RETURNS public.bob_preorders
LANGUAGE plpgsql SET search_path=public AS $$
DECLARE o public.bob_preorders;
BEGIN
  IF p_browser !~ '^[a-f0-9]{64}$'
    OR p_phone !~ '^0[17][0-9]{8}$' OR p_attempt IS NULL
  THEN RAISE EXCEPTION 'Invalid test checkout'; END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended('bob:' || p_browser, 0));
  SELECT * INTO o FROM public.bob_preorders
    WHERE browser_hash=p_browser AND attempt_id=p_attempt;
  IF FOUND THEN
    IF NOT o.is_test THEN RAISE EXCEPTION 'Test attempt mismatch'; END IF;
    RETURN o;
  END IF;
  SELECT * INTO o FROM public.bob_preorders
    WHERE browser_hash=p_browser AND is_test=true
      AND status IN ('created','uncertain','pending','paid')
    ORDER BY created_at DESC LIMIT 1;
  IF FOUND THEN RETURN o; END IF;

  INSERT INTO public.bob_preorders (
    browser_hash, attempt_id, phone, amount, reference, is_test
  ) VALUES (
    p_browser,p_attempt,p_phone,1,
    'RIENG-BOB-TEST-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,20)),true
  ) RETURNING * INTO o;
  RETURN o;
END $$;

-- Ensure the original 150-bob checkout never returns a 1-bob test.
CREATE OR REPLACE FUNCTION public.bob_create_preorder(
  p_browser text,p_attempt uuid,p_phone text
)
RETURNS public.bob_preorders
LANGUAGE plpgsql SET search_path=public AS $$
DECLARE o public.bob_preorders;
BEGIN
  IF p_browser !~ '^[a-f0-9]{64}$' OR p_phone !~ '^0[17][0-9]{8}$'
    OR p_attempt IS NULL THEN RAISE EXCEPTION 'Invalid pre-order request'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('bob:' || p_browser, 0));
  SELECT * INTO o FROM public.bob_preorders
    WHERE browser_hash=p_browser AND attempt_id=p_attempt;
  IF FOUND THEN
    IF o.is_test THEN RAISE EXCEPTION 'Pre-order attempt mismatch'; END IF;
    RETURN o;
  END IF;
  SELECT * INTO o FROM public.bob_preorders
    WHERE browser_hash=p_browser AND is_test=false
      AND status IN ('created','uncertain','pending','paid')
    ORDER BY created_at DESC LIMIT 1;
  IF FOUND THEN RETURN o; END IF;
  INSERT INTO public.bob_preorders (
    browser_hash,attempt_id,phone,amount,reference,is_test
  ) VALUES (
    p_browser,p_attempt,p_phone,150,
    'RIENG-BOB-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,20)),
    false
  ) RETURNING * INTO o;
  RETURN o;
END $$;

CREATE OR REPLACE FUNCTION public.bob_confirm_preorder(
  p_order uuid,p_provider text,p_receipt text,p_amount numeric
)
RETURNS public.bob_preorders
LANGUAGE plpgsql SET search_path=public AS $$
DECLARE o public.bob_preorders;
BEGIN
  SELECT * INTO o FROM public.bob_preorders WHERE id=p_order FOR UPDATE;
  IF NOT FOUND OR o.provider_id IS DISTINCT FROM p_provider
    OR o.amount <> p_amount OR p_receipt !~ '^[A-Z0-9]{8,30}$'
    OR (o.is_test AND o.amount <> 1)
    OR (NOT o.is_test AND o.amount <> 150)
  THEN RAISE EXCEPTION 'Payment does not match BoB checkout'; END IF;

  IF o.status='paid' THEN
    IF o.receipt IS DISTINCT FROM p_receipt
    THEN RAISE EXCEPTION 'Receipt mismatch'; END IF;
    RETURN o;
  END IF;

  UPDATE public.bob_preorders SET
    status='paid',
    receipt=p_receipt,
    code=(CASE WHEN o.is_test THEN 'BOB-TEST-' ELSE 'BOB-' END)
      || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)),
    confirmed_at=clock_timestamp(),
    note=CASE WHEN o.is_test
      THEN 'KSh 1 test successful. Not a valid BoB pre-order.'
      ELSE 'KSh 150 paid. Your BoB pre-order is confirmed.' END
  WHERE id=p_order RETURNING * INTO o;
  RETURN o;
END $$;

ALTER TABLE public.bob_preorders ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.bob_preorders FROM anon,authenticated;
GRANT ALL ON public.bob_preorders TO service_role;
REVOKE ALL ON FUNCTION
  public.bob_create_test_preorder(text,uuid,text)
  FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION
  public.bob_create_test_preorder(text,uuid,text)
  TO service_role;

NOTIFY pgrst, 'reload schema';
COMMIT;
