BEGIN;

-- A standalone BoB pre-order ledger. Never infer a sale from an STK prompt alone.
CREATE TABLE IF NOT EXISTS public.bob_preorders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  browser_hash text NOT NULL,
  attempt_id uuid NOT NULL,
  phone text NOT NULL CHECK (phone ~ '^0[17][0-9]{8}$'),
  amount numeric(12,2) NOT NULL DEFAULT 150 CHECK (amount = 150),
  reference text UNIQUE NOT NULL,
  provider_id text UNIQUE,
  receipt text UNIQUE,
  status text NOT NULL DEFAULT 'created'
    CHECK (status IN ('created','uncertain','pending','failed','paid')),
  note text NOT NULL DEFAULT '',
  code text UNIQUE,
  sms_status text NOT NULL DEFAULT 'pending'
    CHECK (sms_status IN ('pending','sending','sent','failed')),
  sms_attempts integer NOT NULL DEFAULT 0,
  sms_attempted_at timestamptz,
  sms_sent_at timestamptz,
  sms_provider_id text,
  sms_error_code text,
  confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_checked_at timestamptz,
  UNIQUE (browser_hash, attempt_id),
  CONSTRAINT bob_paid_fields CHECK (status <> 'paid' OR (receipt IS NOT NULL AND code IS NOT NULL AND confirmed_at IS NOT NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS bob_one_active_browser_order
  ON public.bob_preorders (browser_hash) WHERE status IN ('created','uncertain','pending','paid');
CREATE INDEX IF NOT EXISTS bob_pending_poll
  ON public.bob_preorders(last_checked_at NULLS FIRST) WHERE status IN ('pending','uncertain','failed') AND provider_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS bob_pending_sms
  ON public.bob_preorders(sms_attempted_at NULLS FIRST) WHERE status='paid' AND sms_status <> 'sent';

CREATE OR REPLACE FUNCTION public.bob_create_preorder(p_browser text, p_attempt uuid, p_phone text)
RETURNS public.bob_preorders LANGUAGE plpgsql SET search_path=public AS $$
DECLARE o public.bob_preorders;
BEGIN
  IF p_browser !~ '^[a-f0-9]{64}$' OR p_phone !~ '^0[17][0-9]{8}$'
     OR p_attempt IS NULL THEN RAISE EXCEPTION 'Invalid pre-order request'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('bob:' || p_browser, 0));
  SELECT * INTO o FROM public.bob_preorders WHERE browser_hash=p_browser AND attempt_id=p_attempt;
  IF FOUND THEN RETURN o; END IF;
  SELECT * INTO o FROM public.bob_preorders
    WHERE browser_hash=p_browser AND status IN ('created','uncertain','pending','paid')
    ORDER BY created_at DESC LIMIT 1;
  IF FOUND THEN RETURN o; END IF;
  INSERT INTO public.bob_preorders(browser_hash,attempt_id,phone,reference)
    VALUES(p_browser,p_attempt,p_phone,'RIENG-BOB-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,20)))
    RETURNING * INTO o;
  RETURN o;
END $$;

CREATE OR REPLACE FUNCTION public.bob_confirm_preorder(p_order uuid, p_provider text, p_receipt text, p_amount numeric)
RETURNS public.bob_preorders LANGUAGE plpgsql SET search_path=public AS $$
DECLARE o public.bob_preorders;
BEGIN
  SELECT * INTO o FROM public.bob_preorders WHERE id=p_order FOR UPDATE;
  IF NOT FOUND OR o.provider_id IS DISTINCT FROM p_provider OR p_amount <> 150
    OR o.amount <> p_amount OR p_receipt !~ '^[A-Z0-9]{8,30}$'
    THEN RAISE EXCEPTION 'Payment confirmation does not match pre-order'; END IF;
  IF o.status='paid' THEN
    IF o.receipt IS DISTINCT FROM p_receipt THEN RAISE EXCEPTION 'Receipt mismatch'; END IF;
    RETURN o;
  END IF;
  UPDATE public.bob_preorders
    SET status='paid', receipt=p_receipt, code='BOB-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)),
      confirmed_at=clock_timestamp(),note='KSh 150 paid. Your BoB pre-order is confirmed.'
    WHERE id=p_order RETURNING * INTO o;
  RETURN o;
END $$;

-- Claim before calling Sozuri: concurrent status polls/callbacks cannot fan out SMS.
CREATE OR REPLACE FUNCTION public.bob_claim_sms(p_order uuid)
RETURNS public.bob_preorders LANGUAGE plpgsql SET search_path=public AS $$
DECLARE o public.bob_preorders;
BEGIN
  UPDATE public.bob_preorders SET sms_status='sending', sms_attempts=sms_attempts+1, sms_attempted_at=clock_timestamp()
  WHERE id=p_order AND status='paid' AND sms_attempts < 5
    AND (sms_status='pending' OR (sms_status IN ('sending','failed') AND sms_attempted_at < now() - interval '2 minutes'))
  RETURNING * INTO o;
  RETURN o;
END $$;

ALTER TABLE public.bob_preorders ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.bob_preorders FROM anon, authenticated;
GRANT ALL ON public.bob_preorders TO service_role;
REVOKE ALL ON FUNCTION public.bob_create_preorder(text,uuid,text),
  public.bob_confirm_preorder(uuid,text,text,numeric),
  public.bob_claim_sms(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.bob_create_preorder(text,uuid,text),
  public.bob_confirm_preorder(uuid,text,text,numeric),
  public.bob_claim_sms(uuid) TO service_role;

COMMIT;
