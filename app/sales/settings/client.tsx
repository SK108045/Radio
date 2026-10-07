'use client'
import { useActionState } from 'react'
import { requestPhoneCodeAction, updatePhoneAction, updatePasswordAction } from '../actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { SessionPayload } from '@/lib/auth'
function Status({ state }: { state: { error?: string; success?: string } | null }) { return <>{state?.error && <p role="alert" className="text-red-400">{state.error}</p>}{state?.success && <p role="status" className="text-green-400">{state.success}</p>}</> }
export function SettingsClient({ session }: { session: SessionPayload }) {
  const [sms, send, sending] = useActionState(requestPhoneCodeAction, null)
  const [phone, changePhone, changing] = useActionState(updatePhoneAction, null)
  const [password, changePassword, saving] = useActionState(updatePasswordAction, null)
  return <div className="p-8 max-w-2xl space-y-8"><h1 className="text-4xl font-bold">Settings</h1><section className="rounded-xl border p-6 space-y-3"><h2 className="text-xl font-semibold">Artist identity</h2><p>{session.stageName}</p><p className="text-muted-foreground">This is your original artist identity and cannot be changed.</p></section>
    <section className="rounded-xl border p-6 space-y-4"><h2 className="text-xl font-semibold">Phone number</h2><p>Current: {session.phone}</p><form action={send} className="space-y-3"><label htmlFor="phone-current">Current password</label><Input id="phone-current" name="currentPassword" type="password" autoComplete="current-password" required /><label htmlFor="new-phone">New phone number</label><Input id="new-phone" name="phone" type="tel" required /><Button disabled={sending || changing}>Send verification code</Button><Status state={sms} /></form>{sms?.challengeId && <form action={changePhone} className="space-y-3"><input type="hidden" name="challengeId" value={sms.challengeId} /><label htmlFor="phone-code">SMS code</label><Input id="phone-code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" required /><label htmlFor="phone-confirm-password">Current password</label><Input id="phone-confirm-password" name="currentPassword" type="password" required /><Button disabled={changing || sending}>Update verified phone</Button><Status state={phone} /></form>}</section>
    <section className="rounded-xl border p-6 space-y-4"><h2 className="text-xl font-semibold">Password</h2><form action={changePassword} className="space-y-3"><label htmlFor="password-current">Current password</label><Input id="password-current" name="currentPassword" type="password" autoComplete="current-password" required /><label htmlFor="password-new">New password</label><Input id="password-new" name="newPassword" type="password" autoComplete="new-password" minLength={10} maxLength={128} required /><label htmlFor="password-confirm">Confirm password</label><Input id="password-confirm" name="confirmPassword" type="password" autoComplete="new-password" minLength={10} maxLength={128} required /><Button disabled={saving}>Update password</Button><Status state={password} /></form></section>
  </div>
}
