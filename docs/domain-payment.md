# Rieng domain payment

Open `/domain-payment` for the KSh 5,000 request to switch **rieng254.com** to **Rieng.ke**. The page uses TrueHost's original logo and public registrar contact details. Rieng collects the payment using the same Swifta merchant API key as the furniture project; this is not a checkout hosted by TrueHost. Registration and DNS changes are arranged separately after payment.

## One-bob test

Open `/payment-test` to send a **real KSh 1 M-Pesa payment** through the same Swifta flow. Enter the paying mobile number and approve the one-bob prompt on that phone. The test page shows the M-Pesa receipt after verification. It uses `/api/payment-test`, a separate HttpOnly cookie, a separate browser recovery marker and `RIENG-TEST-` references. The signed session records the payment purpose, so test state cannot be accepted by the domain endpoint. Both amounts are fixed on the server; a completed test does not pay the KSh 5,000 domain request. The test uses the existing payment environment and needs no extra configuration.

## Configuration

The private repository's `.env` contains `SWIFTA_API_KEY` and a newly generated `DOMAIN_PAYMENT_SECRET`. Existing Radio variables are preserved. These values are server-only. Runtime environment variables override the committed values; Next's output tracing includes `.env` only for the domain payment API function. No new dependencies or database migration are required.

Run `npm ci`, then `npm run build` and `npm start`, or redeploy the existing Next.js application. The page can be shared directly and is excluded from search indexing. It does not add a menu item or affect music payments.

## Payment flow

- The browser requests a signed, HttpOnly checkout cookie and CSRF token from `GET /api/domain-payment`.
- `POST /api/domain-payment` accepts only a Kenyan mobile number. The server supplies the amount (5,000), request reference and domain description, then calls Swifta's `/stkpush` with `x-api-key`.
- Accepted prompts remain pending. Server-side polling of Swifta's public `/poll/:checkoutRequestId` endpoint confirms payment only with a valid M-Pesa receipt; a returned amount must equal 5,000.
- The page polls every ten seconds for five minutes and supports manual checks. Reloads restore the signed checkout cookie for up to seven days. This does not require moving the furniture app's callbacks or registering new callback URLs.
- Explicit declines and cancellations permit a new attempt. Timeouts, interrupted requests and success responses without a checkout ID remain uncertain and do not automatically trigger another prompt. A browser recovery marker also prevents resubmission when an initiation response is lost.

The floating radio player is hidden on this route so it cannot cover checkout controls. Phone numbers and API keys are not logged. The browser receives only the last four phone digits, the request reference, status and confirmed receipt.

## Scope

This is a one-off payment request with signed browser state, not an order ledger. In-flight requests and the three-per-hour session limit are coalesced within each server process. That cache is not a distributed lock: requests using a stale cookie concurrently across multiple server instances, or intentionally clearing browser state, require a shared database to enforce global idempotency. The normal UI locks initiation after submission and never retries an uncertain charge. Verify collections in the Swifta merchant dashboard; retain the M-Pesa receipt before arranging registration.

## Checks

`npm run test:domain-payment` uses mocked provider responses only and checks the fixed amount, phone validation, signed cookies, duplicate submissions, interruption handling and receipt verification. No live KSh 5,000 payment is sent by the test suite.

Brand source: <https://truehost.co.ke/wp-content/uploads/2021/09/logo.png>

Registrar details: <https://truehost.co.ke/contact-us/>
