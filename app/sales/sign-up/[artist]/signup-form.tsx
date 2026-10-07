'use client'
import { useActionState } from 'react'
import { requestSignupCodeAction, signupAction } from '../../actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
export function SignupForm({ slug, stageName }: { slug: string; stageName: string }) {
  const [sms, send, sending] = useActionState(requestSignupCodeAction.bind(null, slug), null)
  const [state, signup, pending] = useActionState(signupAction.bind(null, slug), null)
  return <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 space-y-6"><h1 className="text-3xl font-bold">{stageName}</h1><p className="text-muted-foreground">Claim your artist portal. Your artist identity is permanent.</p>
    <form action={send} className="space-y-3"><label htmlFor="signup-phone">Phone number</label><Input id="signup-phone" name="phone" type="tel" autoComplete="tel" placeholder="0712 345 678" required /><Button disabled={sending || pending}>{sending ? 'Sending…' : sms?.challengeId ? 'Send a new code' : 'Verify phone'}</Button>{sms?.error && <p role="alert" className="text-red-400">{sms.error}</p>}{sms?.success && <p role="status">{sms.success}</p>}</form>
    {sms?.challengeId && <form action={signup} className="space-y-3"><input type="hidden" name="challengeId" value={sms.challengeId} /><label htmlFor="signup-code">SMS code</label><Input id="signup-code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required /><label htmlFor="signup-password">Password</label><Input id="signup-password" name="password" type="password" autoComplete="new-password" minLength={10} maxLength={128} required /><label htmlFor="signup-confirm">Confirm password</label><Input id="signup-confirm" name="confirmPassword" type="password" autoComplete="new-password" minLength={10} maxLength={128} required />{state?.error && <p role="alert" className="text-red-400">{state.error}</p>}<Button disabled={pending || sending}>{pending ? 'Creating account…' : 'Create artist account'}</Button></form>}
  </div>
}
