# BoB pre-orders (SWAT × Unco Jing Jong)

Price: **KSh 150** per pre-order. Uses the existing Swifta STK push account and Sozuri SMS account.

## Enable the checkout on the production database

In a trusted checkout of the Radio repository (with its existing environment credentials), run:

\`\`\`bash
npm ci
npm run migrate:sales
\`\`\`

This applies \`supabase/migrations/202610120001_bob_preorders.sql\` through the existing checksum-tracked migration runner. The page checks that the database table exists **before permitting a payment request**. If the migration is missing, the pre-order dialog displays a temporary-unavailable message without sending an STK prompt.

Required server-only environment settings are \`SWIFTA_API_KEY\`, \`NEXT_PUBLIC_SUPABASE_URL\`, \`SUPABASE_SERVICE_ROLE_KEY\` (or \`SUPABASE_SECRET_KEY\`), \`SOZURI_API_KEY\`, \`SOZURI_PROJECT\`, \`SOZURI_SENDER\` (optional), and \`SOZURI_SMS_TYPE\` (optional). The migration runner also requires \`DATABASE_URL\`. Never use NEXT_PUBLIC for API secrets and never send secrets in a browser request.

## Flow

1. Visitor enters Kenyan M-Pesa number and starts a KSh 150 Swifta STK push.
2. The database atomically reserves the order before Swifta is called. Multiple clicks do not create duplicate prompts for the same browser.
3. A callback or customer polling requests verification directly from Swifta's transaction-poll endpoint. A callback payload alone **cannot** confirm an order.
4. An exact server-side KSh 150 order is marked paid and assigned one unique \`BOB-XXXXXXXXXXXX\` code.
5. An atomic database claim sends the same code via Sozuri to the paid order's phone. Concurrent callbacks or browser polls cannot send duplicates; interrupted sends may retry after two minutes, up to five attempts.
6. The customer can revisit the pre-order dialog in the same browser to see the code, M-Pesa receipt, and SMS acceptance status. SMS acceptance does **not** necessarily mean handset delivery.

BoB orders are intentionally separate from song streaming entitlements and do not expose phone numbers or API credentials to the browser. A buyer must keep their code for fulfillment when the song is released.

## Safe validation

- Open the homepage, click **Pre-Order Now**, and confirm that the displayed amount is KSh 150.
- Enter a real consenting test number and explicitly approve the KSh 150 prompt only when ready to charge.
- Confirm receipt, one persistent BoB code, and Sozuri SMS. Reload to verify it is the **same** code and no new STK request.
- Try a cancelled prompt and verify it remains unpaid. The code must not exist until the transaction verifies.
- Check the database only with an authorized server-side account; never put its service-role key into a public client.


## Real KSh 1 end-to-end test (separate from KSh 150 pre-orders)

The main BoB pre-order remains KSh 150. The private/unlinked test checkout is at
\`/bob-payment-test\`; it performs a **real KSh 1 Swifta STK push**, verifies
payment, creates one \`BOB-TEST-...\` code, and submits an explicitly marked
test SMS via Sozuri. It **does not reserve a BoB copy**.

First, in **Supabase SQL Editor**, paste and run
\`supabase/migrations/202610120002_bob_one_bob_test.sql\`. This preserves
existing orders, adds an isolated test flag and price constraint, and updates
the confirmation function to distinguish real and test transactions.
The KSh 1 page blocks checkout until the new column and SQL are applied.

No Windows migration CLI is needed if you apply the SQL manually. Refresh
\`https://rieng254.com/bob-payment-test\`, enter a test phone number, and
approve the **real** KSh 1 STK push. Verify the test code and Sozuri SMS.
Do not run a live payment automatically.
