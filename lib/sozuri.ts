import 'server-only'
export class SozuriSmsError extends Error {
  constructor(public code: string, message: string, public rejected: boolean) { super(message) }
}
export async function sendVerificationSms(phone: string, code: string, fetcher: typeof fetch = fetch) {
  const apiKey = process.env.SOZURI_API_KEY
  const project = process.env.SOZURI_PROJECT
  if (!apiKey || !project) throw new Error('Phone verification is not configured. Set the Sozuri credentials.')
  // Keep the same request as the working curl in root sozuri_Test.txt.
  let response: Response
  try { response = await fetcher('https://sozuri.net/api/v1/messaging', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, signal: AbortSignal.timeout(15000),
    body: JSON.stringify({ project, apiKey, from: process.env.SOZURI_SENDER || 'Sozuri', to: `+254${phone.slice(1)}`, message: `Your Rieng artist verification code is ${code}. It expires in 5 minutes. Do not share it.`, channel: 'sms', type: process.env.SOZURI_SMS_TYPE || 'promotional' }),
  }) } catch { throw new SozuriSmsError('SMS_NETWORK', 'The SMS provider could not be reached. Please retry shortly.', false) }
  const data = await response.json().catch(() => null)
  const recipient = data?.recipients?.[0]
  const accepted = response.ok && data?.recipients?.length === 1 && ['sent', 'queued', 'accepted'].includes(String(recipient?.status).toLowerCase())
  if (!accepted) {
    const detail = String(data?.messageData?.message || data?.message || recipient?.status || '')
    const credit = /insufficient|balance|credit/i.test(detail)
    const auth = [401,403].includes(response.status) || /project|api.?key|unauthori|authentic/i.test(detail)
    const errorCode = credit ? 'SMS_CREDIT' : auth ? 'SMS_AUTH' : 'SMS_REJECTED'
    // Never log payloads, API credentials, phone numbers or OTP values.
    console.error('Sozuri SMS rejected', { httpStatus: response.status, errorCode, statusCode: recipient?.statusCode || null })
    throw new SozuriSmsError(errorCode, credit ? 'The SMS service has insufficient credits. The site owner needs to top up Sozuri.' : auth ? 'Sozuri rejected the SMS credentials or project. The site owner needs to check the SMS configuration.' : 'Sozuri could not send the verification code. Please retry shortly.', response.status < 500 && data !== null)
  }
  return { messageId: typeof recipient.messageId === 'string' ? recipient.messageId : null }
}
