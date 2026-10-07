# Artist sales setup and verification

The public `/dj-mix-sales` catalog contains only ready tracks from authenticated artist uploads. It contains no seeded music, sample sales, placeholder cards, release notifications or invented statistics. Drafts appear in their owner's portal and stay off the public page until the private upload and generated preview are complete.

The original animated introduction and artist profiles are restored from Git history above the catalog: ambient grid lines, waveform, scrolling ticker and counters. Store counts come from the ready catalog, and the introduction uses the current 30-second preview and 12-hour streaming terms. The original payment code and full-song public URLs are not used.

## Setup

1. Configure `.env` using `.env.example`. `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_SECRET_KEY`) is server-only. Configure Sozuri from root `sozuri.txt`, Swifta using the existing domain-payment credentials, and `SALES_OTP_SECRET` (a random secret of at least 32 bytes). The existing `DOMAIN_PAYMENT_SECRET` is an OTP secret fallback for existing installations.
2. Run `npm run migrate:sales` with your Supabase Postgres `DATABASE_URL`, or run the SQL files in `supabase/migrations` once in filename order in the Supabase SQL editor. The second migration adds the explicitly requested test artist; the third adds SMS send tracking and fixes request limits. Applied migrations are preserved. The migration runner remembers checksums and makes repeated execution safe. It verifies remote TLS using the bundled public Supabase CA, whose download URL comes from [Supabase's dashboard configuration](https://github.com/supabase/supabase/blob/master/apps/studio/hooks/custom-content/custom-content.json). `DATABASE_CA_CERT` can select a different CA file. Percent-encode special characters in the URL's password (for example `@` becomes `%40`). Do not run the old storage dev policies.
3. Configure your Swifta application's callback URL as `https://YOUR_HOST/api/music/swifta/callback`. The callback body is a hint: the server verifies the saved checkout with Swifta's existing `/poll/{CheckoutRequestID}` endpoint before recording any sale. Successful confirmation requires a provider success status, a valid receipt and the exact quoted amount. No client/callback claim can bypass this.
4. Set `SALES_SITE_URL` to your deployed origin and schedule `npm run reconcile:sales` every minute (for example with cron, using the repo as the working directory). Each scheduled command calls `POST /api/music/reconcile` with `Authorization: Bearer YOUR_SALES_RECONCILE_SECRET`. This catches abandoned browser checkouts and missed callbacks. The script runs more batches while either count is 25; the oldest unchecked items are processed first. Failed orders are checked too, to recover delayed success, without an age cutoff. Provider failures are isolated per item and rotated to the next attempt so they cannot block other sales. Uncertain orders without a provider ID are deliberately blocked from automatic recharging; reconcile their saved account reference with the provider before any manual resolution.
5. Use Node 20.20+ and install dependencies. Linux FFmpeg is bundled by `ffmpeg-static` and traced into the preview route. A deployment may set `FFMPEG_PATH` to its system binary instead. Preview processing requires a Node runtime with a writable temporary directory and enough execution time (up to 180 seconds).

## Artist signup

Give each artist its corresponding URL:

- `/sales/sign-up/Metro_Stunna/` (lowercase `/sales/sign-up/metro_stunna/` also works)
- `/sales/sign-up/swatt/`
- `/sales/sign-up/kapitani/`

Signup has three steps: request the SMS code, verify that code, then choose a password of 10–128 characters and confirm it. Password inputs are hidden until verification succeeds. The server also requires an HttpOnly signed verification cookie before claiming the account, so bypassing the UI cannot skip verification. Phone/code inputs retain their values after errors. Confirmed SMS requests can be reused for 60 seconds to avoid duplicate sends; the form shows a resend countdown. Definitive gateway rejections refund send limits, while ambiguous network failures retain their reservation. Sender/type/request fields match the working root Sozuri example. Safe provider error codes and message IDs are recorded without logging OTPs or credentials. The phone is taken from the verified challenge, not a separate client field. A row lock consumes the signup exactly once. Legacy artist IDs for Swat and Metro Stunna are preserved; Kapitani has its own ID. Existing unrelated artists remain in the database but cannot register in this flow. The old insecure credentials are invalidated and the plaintext password column is dropped.

Login is phone + password. Passwords use salted scrypt hashes. HttpOnly cookies contain random opaque session identifiers; the server checks hashed identifiers in the database. Settings allow verified phone and password changes with the current password and revoke old sessions. The original identity is immutable.

## Temporary Metro demo signup

Migration `202610070004_metro_demo_signup.sql` enables phone + password + confirmation signup for Metro_Stunna only, at `/sales/sign-up/metro_stunna/`. It creates no account until the artist submits that form, hashes the password normally and atomically consumes the one-time link. The registry's `demo_signup_enabled` flag is cleared on successful signup. Other identities still require verified SMS, and Settings phone changes still require verification. To disable the exception before signup, set `demo_signup_enabled=false` for `slug='metro_stunna'` through a trusted database connection. The server checks this flag; browser input cannot enable the bypass.

## Experiment account

Use `/sales/sign-up/test_artist/` to claim **Test_Artist** with your own phone number, a Sozuri SMS verification code, password and password confirmation. It exercises the same signup implementation as the three production artists. After successful signup the link becomes unusable; subsequent login uses your chosen phone number and password. No pre-created login, generated default password, sample music or fake receipts are supplied.

The registry marks this identity `is_test=true`. Exactly three production artists remain, and test tracks are excluded from `/dj-mix-sales`. Upload your own audio from the test portal: the real sales card appears under **Try the sales experience** in that portal. Preview, Swifta checkout, private 12-hour playback, credential settings and sales reporting use the same implementation as the production artists. A KSh 1 track can be used for a small purchase, but M-Pesa payments are **real charges**, not simulated transactions. Confirmed test purchases credit only Test_Artist and never the three production artists.

## Uploads and listening

The server assigns every draft its authenticated artist ID and an immutable private object path. The browser receives an expiring signed upload grant, then uploads with TUS to the direct Storage host at `/storage/v1/upload/resumable/sign`. Chunks are 6 MiB; progress, retry, pause/resume and same-file resume after reload are supported. Gemini enhancement runs concurrently for every upload. An unavailable AI service leaves the artist's description intact.

After upload the server checks object size, downloads it privately, and uses FFmpeg to encode a separate clip of the first 30 seconds. Only that clip can be previewed without paying. Finalization marks the track ready and the real catalog immediately includes it. Preview generation failures leave a retryable private draft; retrying recognizes the completed original and skips uploading it again. Uploaded playlists are rejected so they cannot reference other server files. Archiving hides tracks but retains accounting and already-paid playback.

The browser identity is a random HttpOnly Secure cookie, and entitlements are durable records bound to its hash and track. Confirmation creates a receipt and entitlement in one database transaction. Access expires exactly 12 hours after confirmation; repeats cannot extend it. Full-track signed URLs last at most 60 seconds, bounded by entitlement expiry. No full-song object paths or permanent MP3 URLs are serialized into the catalog. The card uses a custom play/pause control with no download control. The server refuses the legacy general download endpoint.

Audio streaming necessarily delivers audio bytes to a browser; ordinary signed URLs and hidden download controls are not DRM. Browser expiry prevents new playback grants and the player stops at expiry, but previously buffered bytes cannot be recalled.

## Accounting and reconciliation

` sales_orders ` captures the trusted artist ID, track ID, server price, browser hash, request idempotency key and provider reference before initiation. A durable status compare-and-swap sends STK once. A partial unique index prevents competing open checkouts in the same browser for a track. Pending, uncertain and failed orders never populate `sales_receipts`.

` sales_confirm_order ` locks the order, validates provider/amount/receipt, and atomically creates a unique receipt and entitlement. Unique constraints cover order, reference, provider ID and transaction ID. The receipt has a composite FK back to the order's artist/track/amount. A database failure returns an error so the callback/poll can retry. The artist portal queries only its authenticated artist ID from `sales_receipts` and refreshes every five seconds while visible.

If Swifta accepts a charge but its initiation response loses the checkout ID, the order remains uncertain with its durable account reference. Do not automatically send another charge. The provider must supply the ID for safe reconciliation. Configure callback forwarding and the reconciliation schedule before accepting live purchases.

## Tests

`npm run typecheck`, `npm run build`, and `npm run test:domain-payment` run without sending real SMS or payment prompts.

`npm run test:sales` needs PostgreSQL binaries, a PostgREST binary, FFmpeg and Chrome. The runner creates and stops a temporary local Postgres instance automatically. Set `PG_BIN` if your PostgreSQL binaries are outside `/usr/lib/postgresql/<version>/bin`. To use an existing disposable **local** server instead, set `SALES_TEST_DATABASE_URL`. It creates and drops an isolated test database, applies a legacy-schema fixture plus the actual migration, exercises the actual Supabase SDK against PostgREST, invokes the production actions/routes, and uses real FFmpeg. Set `POSTGREST_BIN` to the installed PostgREST binary (the runner also checks `/tmp/postgrest`, then `PATH`). External SMS, Swifta and Storage APIs are mocked. Test fixture songs are isolated in the temporary database and are never inserted into the live catalog.

Coverage includes verified single-use signup, phone login, password hashes, forged-session rejection, owner isolation, immutable tracks, publishing, 30-second clip duration, private playback authorization, STK deduplication, pending/failed/mismatched/forged payment rejection, concurrent callback idempotency, exact artist accounting, receipt reuse rejection, rollback/retry, browser isolation, expiry, credential changes, session revocation and anonymous table/storage denial. The Playwright test drives the real Next.js frontend through signup, upload, preview, confirmed purchase, full playback, reload, isolated browser denial, and artist reporting using the isolated database. The test artist checks additionally exercise its verified one-time signup through the real UI, verify its password hash, exercise its uploaded sales cards and payments, and keep its tracks off the public catalog. Chrome is required (`CHROME_PATH`, default `/usr/bin/google-chrome`). It uses `next dev --webpack` on port 3117. The standalone TUS test interrupts a 13 MiB file and resumes at 6 MiB without duplicating its bytes.

After deployment, verify one real artist signup with SMS, one real audio upload/resume, and a low-value Swifta payment in your own browser. Check the exact receipt in that artist's portal, reload playback, verify another browser is locked, then test expiry. Do not claim production SMS or payment confirmation from mocked local tests.
