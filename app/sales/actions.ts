'use server'
import { randomInt, randomUUID } from 'node:crypto'
import { adminDb, requireData, rateLimit } from '@/lib/supabase-admin'
import { setSession, clearSession, getSession } from '@/lib/auth'
import { artistSlug, hashPassword, verifyPassword, otpDigest, validPassword, digest } from '@/lib/sales-security'
import { normalizePhone } from '@/lib/domain-payment'
import { sendVerificationSms } from '@/lib/sozuri'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
type ActionResult = { error?: string; success?: string; challengeId?: string }
type ActionState = { error?: string; success?: string; challengeId?: string } | null
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
  await rateLimit(`otp-artist:${artistId}`, 3, 900)
  await rateLimit(`otp-phone:${digest(phone)}`, 3, 900)
  const id = randomUUID(), code = String(randomInt(100000, 1000000))
  requireData(await adminDb().from('sales_otp_challenges').insert({ id, artist_id: artistId, phone, purpose, code_hash: otpDigest(id, code), expires_at: new Date(Date.now() + 300000).toISOString() }).select('id').single())
  await sendVerificationSms(phone, code)
  return { challengeId: id, success: 'Verification code sent. It expires in 5 minutes.' }
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
export async function signupAction(slug: string, _state: ActionState, form: FormData) {
  let artistId: string
  try {
    const a = await registry(slug), password = value(form, 'password')
    if (!validPassword(password)) throw new Error('Use a password with 10–128 characters.')
    if (password !== value(form, 'confirmPassword')) throw new Error('Passwords do not match.')
    const challenge = await verifyOtp(form, a.artist_id, 'signup')
    const result = await adminDb().rpc('sales_claim_artist', { p_slug: a.slug, p_challenge: challenge, p_password_hash: await hashPassword(password) })
    if (result.error) throw new Error(result.error.code === '23505' ? 'This phone is already registered.' : 'Signup link is unavailable or verification expired.')
    artistId = result.data as string
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
