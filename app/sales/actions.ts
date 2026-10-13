'use server'
import { randomInt, randomUUID, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { adminDb, requireData, rateLimit } from '@/lib/supabase-admin'
import { setSession, clearSession, getSession } from '@/lib/auth'
import { artistSlug, hashPassword, verifyPassword, otpDigest, validPassword, digest } from '@/lib/sales-security'
import { normalizePhone } from '@/lib/domain-payment'
import { sendVerificationSms, SozuriSmsError } from '@/lib/sozuri'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
type ActionResult = { error?: string; success?: string; challengeId?: string; verified?: boolean; retryAfterSeconds?: number }
type ActionState = ActionResult | null
const VERIFIED_COOKIE = 'sales_signup_verified'
const signupProof = (id: string) => `${id}.${otpDigest('signup-proof', id)}`
const value = (form: FormData, name: string) => String(form.get(name) || '')
const failure = (e: unknown): ActionResult => ({ error: e instanceof Error ? e.message : 'The request could not be completed.' })
async function registry(slug: string) {
  const valid = artistSlug(slug)
  if (!valid) throw new Error('Signup link is unavailable.')
  const row = requireData(await adminDb().from('sales_artist_registry').select('*').eq('slug', valid).single())
  if (row.claimed_at) throw new Error('This artist has already signed up. Please sign in.')
  return row
}
async function issueOtp(artistId: string, phone: string, purpose: 'signup' | 'phone-change'): Promise<ActionResult> {
  const db = adminDb(), artistKey = `otp-artist:${artistId}`, phoneKey = `otp-phone:${digest(phone)}`
  const recent = requireData(await db.from('sales_otp_challenges').select('id,sms_sent_at').eq('artist_id',artistId).eq('phone',phone).eq('purpose',purpose).is('consumed_at',null).gt('expires_at',new Date().toISOString()).gt('sms_sent_at',new Date(Date.now()-60000).toISOString()).order('sms_sent_at',{ascending:false}).limit(1))
  if (recent.length) return { challengeId: recent[0].id, retryAfterSeconds: Math.max(1,60-Math.floor((Date.now()-new Date(recent[0].sms_sent_at!).getTime())/1000)), success: 'A code was just sent. Enter it below, or resend after the countdown.' }
  await rateLimit(artistKey, 10, 900)
  try { await rateLimit(phoneKey, 5, 900) } catch(e) { await db.rpc('sales_release_otp_limit',{p_key:artistKey});throw e }
  const id = randomUUID(), code = String(randomInt(100000, 1000000))
  requireData(await db.from('sales_otp_challenges').insert({ id, artist_id: artistId, phone, purpose, code_hash: otpDigest(id, code), expires_at: new Date(Date.now() + 300000).toISOString() }).select('id').single())
  try {
    const sent = await sendVerificationSms(phone, code)
    requireData(await db.from('sales_otp_challenges').update({sms_sent_at:new Date().toISOString(),sms_message_id:sent.messageId}).eq('id',id).select('id').single())
  } catch(e) {
    await db.from('sales_otp_challenges').update({sms_failure_code:e instanceof SozuriSmsError ? e.code : 'SMS_SAVE_FAILED'}).eq('id',id)
    if (e instanceof SozuriSmsError && e.rejected) {
      await db.rpc('sales_release_otp_limit',{p_key:artistKey});await db.rpc('sales_release_otp_limit',{p_key:phoneKey})
      await db.from('sales_otp_challenges').update({expires_at:new Date().toISOString()}).eq('id',id)
    }
    throw e
  }
  return { challengeId: id, retryAfterSeconds: 60, success: 'Code submitted to Sozuri. Enter the six-digit SMS code to verify your phone.' }
}
async function verifyOtp(form: FormData, artistId: string, purpose: string) {
  const id = value(form, 'challengeId'), code = value(form, 'code')
  if (!/^[0-9a-f-]{36}$/i.test(id) || !/^\d{6}$/.test(code)) throw new Error('Enter the six-digit verification code.')
  const valid = requireData(await adminDb().rpc('sales_verify_otp', { p_id: id, p_hash: otpDigest(id, code), p_artist: artistId, p_purpose: purpose }))
  if (!valid) throw new Error('Invalid or expired code. Request a new code after the cooldown.')
  return id
}
export async function requestSignupCodeAction(slug: string, _state: ActionState, form: FormData) {
  try { const a = await registry(slug), phone = normalizePhone(value(form, 'phone')); if (!phone) throw new Error('Enter a valid Kenyan phone number.'); return await issueOtp(a.artist_id, phone, 'signup') } catch (e) { return failure(e) }
}
export async function verifySignupCodeAction(slug: string, _state: ActionState, form: FormData) {
  try {
    const a = await registry(slug), id = await verifyOtp(form,a.artist_id,'signup')
    ;(await cookies()).set(VERIFIED_COOKIE,signupProof(id),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/sales/sign-up',maxAge:300})
    return {verified:true,challengeId:id,success:'Phone verified. Now choose your password.'}
  } catch(e) { return failure(e) }
}
export async function signupAction(slug: string, _state: ActionState, form: FormData) {
  let artistId: string
  try {
    const a = await registry(slug), password = value(form, 'password')
    const demo = (a.slug === 'metro_stunna' || a.slug === 'swatt' || (a.slug === 'test_artist' && a.is_test)) && a.demo_signup_enabled
    const challenge = value(form,'challengeId')
    if (!demo) {
      const proof = (await cookies()).get(VERIFIED_COOKIE)?.value || '', expected = signupProof(challenge)
      if (!/^[0-9a-f-]{36}$/i.test(challenge) || proof.length!==expected.length || !timingSafeEqual(Buffer.from(proof),Buffer.from(expected))) throw new Error('Verify your phone with the SMS code before setting a password.')
    }
    if (!validPassword(password)) throw new Error('Use a password with 10–128 characters.')
    if (password !== value(form, 'confirmPassword')) throw new Error('Passwords do not match.')
    const phone = demo ? normalizePhone(value(form,'phone')) : null
    if (demo && !phone) throw new Error('Enter a valid Kenyan phone number.')
    if (demo) await rateLimit(`demo-signup:${a.artist_id}`,8,900)
    const passwordHash = await hashPassword(password)
    const result = demo
      ? await adminDb().rpc(a.slug === 'test_artist' ? 'sales_claim_test_demo' : a.slug === 'swatt' ? 'sales_claim_swatt_no_sms' : 'sales_claim_metro_demo',{p_phone:phone,p_password_hash:passwordHash})
      : await adminDb().rpc('sales_claim_artist', { p_slug: a.slug, p_challenge: challenge, p_password_hash: passwordHash })
    if (result.error) throw new Error(result.error.code === '23505' ? 'This phone is already registered.' : 'Signup link is unavailable or verification expired.')
    artistId = result.data as string
    ;(await cookies()).delete({name:VERIFIED_COOKIE,path:'/sales/sign-up'})
    await setSession(artistId)
  } catch (e) { return failure(e) }
  redirect('/sales')
}
export async function loginAction(_state: ActionState, form: FormData) {
  try {
    const phone = normalizePhone(value(form, 'phone')), password = value(form, 'password')
    if (!phone || !password) throw new Error('Phone number and password are required.')
    await rateLimit(`login:${digest(phone)}`, 8, 900)
    const { data, error } = await adminDb().from('sales_artist_accounts').select('artist_id,password_hash').eq('phone', phone).maybeSingle()
    if (error) throw new Error('Sign-in is temporarily unavailable.')
    // Perform scrypt for nonexistent accounts too, avoiding a fast identity oracle.
    const dummy = `scrypt$${'0'.repeat(32)}$${'0'.repeat(128)}`
    const matches = await verifyPassword(password, data?.password_hash || dummy)
    if (!data || !matches) throw new Error('Invalid phone number or password.')
    await setSession(data.artist_id)
  } catch (e) { return failure(e) }
  redirect('/sales')
}
export async function logoutAction() { await clearSession(); redirect('/sales/login') }
async function currentAccount(form: FormData) {
  const session = await getSession()
  if (!session) throw new Error('Please sign in again.')
  await rateLimit(`credentials:${session.artistId}`, 8, 900)
  const account = requireData(await adminDb().from('sales_artist_accounts').select('password_hash').eq('artist_id', session.artistId).single())
  if (!await verifyPassword(value(form, 'currentPassword'), account.password_hash)) throw new Error('Incorrect current password.')
  return session
}
export async function requestPhoneCodeAction(_state: ActionState, form: FormData) {
  try { const session = await currentAccount(form), phone = normalizePhone(value(form, 'phone')); if (!phone) throw new Error('Enter a valid Kenyan phone number.'); return await issueOtp(session.artistId, phone, 'phone-change') } catch (e) { return failure(e) }
}
export async function updatePhoneAction(_state: ActionState, form: FormData) {
  try {
    const session = await currentAccount(form), challenge = await verifyOtp(form, session.artistId, 'phone-change')
    const result = await adminDb().rpc('sales_change_phone', { p_artist: session.artistId, p_challenge: challenge })
    if (result.error) throw new Error(result.error.code === '23505' ? 'This phone is already registered.' : 'Phone could not be updated.')
    await setSession(session.artistId); revalidatePath('/sales/settings'); return { success: 'Verified phone number updated. Other sessions were signed out.' }
  } catch (e) { return failure(e) }
}
export async function updatePasswordAction(_state: ActionState, form: FormData) {
  try {
    const session = await currentAccount(form), password = value(form, 'newPassword')
    if (password !== value(form, 'confirmPassword')) throw new Error('Passwords do not match.')
    const result = await adminDb().rpc('sales_change_password', { p_artist: session.artistId, p_hash: await hashPassword(password) })
    if (result.error) throw new Error('Password could not be updated.')
    await setSession(session.artistId); return { success: 'Password updated. Other sessions were signed out.' }
  } catch (e) { return failure(e) }
}
export async function deleteTrackAction(trackId: string, _ignoredPath?: string | null): Promise<{ error?: string; success?: boolean }> {
  try {
    const session = await getSession(); if (!session) throw new Error('Please sign in again.')
    // Archive instead of deleting financial history or purchased playback assets.
    requireData(await adminDb().from('tracks').update({ sales_status: 'archived' }).eq('id', trackId).eq('artist_id', session.artistId).select('id').single())
    revalidatePath('/sales'); revalidatePath('/dj-mix-sales'); return { success: true }
  } catch (e) { return { error: failure(e).error } }
}
