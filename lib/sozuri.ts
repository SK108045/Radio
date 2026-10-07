import 'server-only'
export async function sendVerificationSms(phone: string, code: string, fetcher: typeof fetch = fetch) {
  const apiKey = process.env.SOZURI_API_KEY
  const project = process.env.SOZURI_PROJECT
  if (!apiKey || !project) throw new Error('Phone verification is not configured. Set the Sozuri credentials.')
  // API shape documented by the repository's root sozuri_Test.txt.
  const response = await fetcher('https://sozuri.net/api/v1/messaging', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, signal: AbortSignal.timeout(15000),
    body: JSON.stringify({ project, apiKey, from: process.env.SOZURI_SENDER || 'Sozuri', to: `+254${phone.slice(1)}`, message: `Your Rieng artist verification code is ${code}. It expires in 5 minutes. Do not share it.`, channel: 'sms', type: process.env.SOZURI_SMS_TYPE || 'promotional' }),
  })
  const data = await response.json()
  if (!response.ok || !data.recipients?.length || !data.recipients.every((r: { status: string }) => ['sent', 'queued', 'accepted'].includes(r.status))) throw new Error('The verification SMS could not be sent. Try again later.')
}
