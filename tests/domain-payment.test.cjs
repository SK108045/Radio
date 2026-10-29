const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

// Load the TypeScript server helpers without Next's build-time server-only
// marker. Every provider call below uses a fake fetcher; no real prompts send.
const loaded = new Map()
function load(file) {
  if (loaded.has(file)) return loaded.get(file).exports
  const module = { exports: {} }
  loaded.set(file, module)
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText
  const customRequire = name => name === 'server-only' ? {} : name.startsWith('.') ? load(path.resolve(path.dirname(file), `${name}.ts`)) : require(name)
  new Function('require', 'module', 'exports', code)(customRequire, module, module.exports)
  return module.exports
}
process.env.SWIFTA_API_KEY = 'test-key-no-live-requests'
process.env.DOMAIN_PAYMENT_SECRET = 'test-cookie-secret-not-a-production-key'
const payments = load(path.resolve(__dirname, '../lib/domain-payment.ts'))
const response = body => new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })
const pending = () => ({ ...payments.newSession(), status: 'pending', providerId: 'checkout-test', reference: 'RIENG-DOM-TEST' })

test('Kenyan phone normalization accepts 07, 01 and international numbers', () => {
  for (const value of ['0712 345 678', '+254712345678', '254712345678', '(0712) 345-678']) assert.equal(payments.normalizePhone(value), '0712345678')
  assert.equal(payments.normalizePhone('0112345678'), '0112345678')
  for (const value of ['+255712345678', '071234567', '0212345678', null, {}, 712345678]) assert.equal(payments.normalizePhone(value), null)
})
test('signed checkout cookies reject tampering and expiration', () => {
  const session = payments.newSession()
  const token = payments.signSession(session)
  assert.deepEqual(payments.readSession(token), session)
  assert.equal(payments.readSession(token + 'x'), null)
  assert.equal(payments.readSession(payments.signSession({ ...session, expiresAt: Date.now() - 1 })), null)
  assert.equal(payments.validCsrf(session, 'wrong'), false)
  assert.equal(payments.validCsrf(session, payments.csrfToken(session)), true)
})
test('Swifta receives exactly KSh 5,000 and nested acceptance stays pending', async () => {
  const result = await payments.requestDomainStk('0712345678', 'RIENG-DOM-TEST', async (url, options) => {
    assert.equal(url, 'https://app.swifta.co.ke/stkpush')
    assert.equal(options.headers['x-api-key'], 'test-key-no-live-requests')
    assert.deepEqual(JSON.parse(options.body), { phone: '0712345678', amount: 5000, accountReference: 'RIENG-DOM-TEST', description: 'Rieng domain switch to Rieng.ke' })
    return response({ success: true, data: { mpesaResponse: { ResponseCode: '0', CheckoutRequestID: 'nested-checkout' } } })
  })
  assert.equal(result.status, 'pending')
  assert.equal(result.providerId, 'nested-checkout')
})
test('Swifta meta checkout IDs are supported', async () => {
  const result = await payments.requestDomainStk('0712345678', 'TEST', async () => response({ success: true, meta: { checkoutRequestId: 'meta-checkout' } }))
  assert.equal(result.providerId, 'meta-checkout')
  assert.equal(result.status, 'pending')
})
test('blocked gateway requests fail and ambiguous replies stay locked', async () => {
  const blocked = await payments.requestDomainStk('0712345678', 'TEST', async () => new Response('<html>blocked</html>', { status: 403 }))
  assert.equal(blocked.status, 'failed')
  const serverError = await payments.requestDomainStk('0712345678', 'TEST', async () => new Response('', { status: 502 }))
  assert.equal(serverError.status, 'uncertain')
  const interrupted = await payments.requestDomainStk('0712345678', 'TEST', async () => { throw new Error('timeout') })
  assert.equal(interrupted.status, 'uncertain')
  const missingId = await payments.requestDomainStk('0712345678', 'TEST', async () => response({ success: true }))
  assert.equal(missingId.status, 'uncertain')
})
test('provider success requires a receipt and rejects a mismatched amount', async () => {
  const session = pending()
  const missingReceipt = await payments.pollDomainPayment(session, async () => response({ status: 'success', amount: 5000 }))
  assert.equal(missingReceipt.status, 'pending')
  const wrongAmount = await payments.pollDomainPayment(session, async () => response({ status: 'success', amount: 1, mpesaReceiptNumber: 'TEST123456' }))
  assert.equal(wrongAmount.status, 'pending')
  const paid = await payments.pollDomainPayment(session, async () => response({ transaction: { status: 'success', amount: '5000', mpesaReceiptNumber: 'test123456' } }))
  assert.equal(paid.status, 'paid')
  assert.equal(paid.receipt, 'TEST123456')
})
test('cancellation allows a later retry; a status outage preserves pending', async () => {
  const session = pending()
  assert.equal((await payments.pollDomainPayment(session, async () => response({ status: 'cancelled' }))).status, 'failed')
  assert.equal((await payments.pollDomainPayment(session, async () => { throw new Error('offline') })).status, 'pending')
})
test('duplicate submits coalesce even when a status check arrives during initiation', async () => {
  const session = payments.newSession()
  payments.rememberSession(session)
  let calls = 0, release
  const blocked = new Promise(resolve => { release = resolve })
  const push = async () => { calls++; await blocked; return { status: 'pending', providerId: 'one-checkout', note: 'Pending' } }
  const first = payments.startPayment(session, 'attempt-1', '0712345678', push)
  payments.rememberSession(payments.latestSession(session))
  const second = payments.startPayment(session, 'attempt-1', '0712345678', push)
  release()
  const [a, b] = await Promise.all([first, second])
  assert.equal(calls, 1)
  assert.equal(a.providerId, b.providerId)
  assert.equal(payments.latestSession(session).status, 'pending')
  await payments.startPayment(session, 'different-attempt', '0712345678', push)
  assert.equal(calls, 1)
})
test('uncertain requests cannot be resubmitted and paid sessions cannot be downgraded', async () => {
  const session = payments.newSession()
  let calls = 0
  const push = async () => { calls++; return { status: 'uncertain', note: 'Interrupted' } }
  const uncertain = await payments.startPayment(session, 'attempt-1', '0712345678', push)
  await payments.startPayment(uncertain, 'attempt-2', '0712345678', push)
  assert.equal(calls, 1)
  payments.rememberSession({ ...uncertain, status: 'paid', receipt: 'TEST123456' })
  payments.rememberSession({ ...uncertain, status: 'failed' })
  assert.equal(payments.latestSession(uncertain).status, 'paid')
})
test('definitively failed attempts can retry, while the same attempt remains idempotent', async () => {
  const session = payments.newSession()
  let calls = 0
  const push = async () => { calls++; return { status: 'failed', note: 'Declined' } }
  const failed = await payments.startPayment(session, 'attempt-1', '0712345678', push)
  await payments.startPayment(failed, 'attempt-1', '0712345678', push)
  assert.equal(calls, 1)
  await payments.startPayment(failed, 'attempt-2', '0712345678', push)
  assert.equal(calls, 2)
})

test('the test request sends exactly one bob to Swifta', async () => {
  const result = await payments.requestTestStk('0712345678', 'RIENG-TEST-12345678', async (url, options) => {
    assert.equal(url, 'https://app.swifta.co.ke/stkpush')
    assert.deepEqual(JSON.parse(options.body), { phone: '0712345678', amount: 1, accountReference: 'RIENG-TEST-12345678', description: 'Rieng KSh 1 payment test' })
    return response({ success: true, checkoutRequestId: 'one-bob-checkout' })
  })
  assert.equal(result.status, 'pending')
  assert.ok(result.note.includes('KSh 1.'))
})
test('signed test payment state cannot be used as domain payment state', () => {
  const paidTest = { ...payments.newSession('test'), status: 'paid', receipt: 'TEST123456' }
  const token = payments.signSession(paidTest)
  assert.equal(payments.readSession(token), null)
  assert.deepEqual(payments.readSession(token, 'test'), paidTest)
  assert.equal(payments.readSession(payments.signSession(payments.newSession()), 'test'), null)
  assert.equal(payments.summary(paidTest).amount, 1)
  assert.equal(payments.summary(payments.newSession()).amount, 5000)
})
test('a one-bob receipt confirms only a test payment', async () => {
  const fetcher = async () => response({ status: 'success', amount: 1, mpesaReceiptNumber: 'TEST123456' })
  const testPayment = { ...payments.newSession('test'), status: 'pending', providerId: 'test-checkout' }
  assert.equal((await payments.pollDomainPayment(testPayment, fetcher)).status, 'paid')
  assert.equal((await payments.pollDomainPayment(pending(), fetcher)).status, 'pending')
})
test('test sessions choose the one-bob request by default and use test references', async () => {
  const originalFetch = globalThis.fetch
  try {
    globalThis.fetch = async (url, options) => {
      const sent = JSON.parse(options.body)
      assert.equal(sent.amount, 1)
      assert.ok(sent.accountReference.startsWith('RIENG-TEST-'))
      return response({ success: true, checkoutRequestId: 'test-session-checkout' })
    }
    const result = await payments.startPayment(payments.newSession('test'), 'one-bob-attempt', '0712345678')
    assert.equal(result.status, 'pending')
    assert.equal(result.purpose, 'test')
  } finally { globalThis.fetch = originalFetch }
})
