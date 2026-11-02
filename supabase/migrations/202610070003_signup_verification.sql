BEGIN;
ALTER TABLE public.sales_otp_challenges ADD COLUMN sms_sent_at timestamptz;
ALTER TABLE public.sales_otp_challenges ADD COLUMN sms_message_id text;
ALTER TABLE public.sales_otp_challenges ADD COLUMN sms_failure_code text;
-- Rejected requests must not keep increasing an already exhausted counter.
CREATE OR REPLACE FUNCTION public.sales_rate_limit(p_key text,p_max integer,p_seconds integer) RETURNS boolean
LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 INSERT INTO sales_rate_limits(key,hits,resets_at) VALUES(p_key,1,now()+make_interval(secs=>p_seconds))
 ON CONFLICT(key) DO UPDATE SET
  hits=CASE WHEN sales_rate_limits.resets_at<=now() THEN 1 ELSE sales_rate_limits.hits+1 END,
  resets_at=CASE WHEN sales_rate_limits.resets_at<=now() THEN now()+make_interval(secs=>p_seconds) ELSE sales_rate_limits.resets_at END
 WHERE sales_rate_limits.resets_at<=now() OR sales_rate_limits.hits<p_max;
 RETURN FOUND;
END $$;
-- Refund only a reserved request that the SMS gateway definitively rejected.
CREATE FUNCTION public.sales_release_otp_limit(p_key text) RETURNS void
LANGUAGE sql SET search_path=public AS $$
 UPDATE sales_rate_limits SET hits=GREATEST(0,hits-1) WHERE key=p_key AND key LIKE 'otp-%';
$$;
REVOKE ALL ON FUNCTION public.sales_release_otp_limit(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.sales_release_otp_limit(text) TO service_role;
COMMIT;
