'use client'
import { useActionState, useEffect, useState } from 'react'
import { requestSignupCodeAction, verifySignupCodeAction, signupAction } from '../../actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
export function SignupForm({ slug, stageName, demoSignup = false }: { slug: string; stageName: string; demoSignup?: boolean }) {
  return demoSignup ? <DemoSignupForm slug={slug} stageName={stageName} /> : <VerifiedSignupForm slug={slug} stageName={stageName} />
}
function DemoSignupForm({slug,stageName}: {slug:string;stageName:string}) {
  const [state,signup,pending] = useActionState(signupAction.bind(null,slug),null)
  const [phone,setPhone] = useState(''),[password,setPassword] = useState(''),[confirmation,setConfirmation] = useState('')
  return <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 space-y-6">
    <h1 className="text-3xl font-bold">{stageName}</h1>
    <p className="text-muted-foreground">Create your artist account with your phone number and password.</p>
    <form action={signup} className="space-y-3">
      <label htmlFor="demo-phone">Phone number</label><Input id="demo-phone" name="phone" type="tel" autoComplete="tel" placeholder="0712 345 678" value={phone} onChange={e=>setPhone(e.target.value)} required />
      <label htmlFor="demo-password">Password</label><Input id="demo-password" name="password" type="password" autoComplete="new-password" minLength={10} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)} required />
      <p className="text-sm text-muted-foreground">Use at least 10 characters.</p>
      <label htmlFor="demo-confirm">Confirm password</label><Input id="demo-confirm" name="confirmPassword" type="password" autoComplete="new-password" minLength={10} maxLength={128} value={confirmation} onChange={e=>setConfirmation(e.target.value)} required />
      {state?.error && <p role="alert" className="text-red-400">{state.error}</p>}
      <Button disabled={pending}>{pending ? 'Creating account…' : 'Create artist account'}</Button>
    </form>
  </div>
}
function VerifiedSignupForm({ slug, stageName }: { slug: string; stageName: string }) {
  const [sms, send, sending] = useActionState(requestSignupCodeAction.bind(null, slug), null)
  const [verification, verify, verifying] = useActionState(verifySignupCodeAction.bind(null, slug), null)
  const [state, signup, pending] = useActionState(signupAction.bind(null, slug), null)
  const [remaining,setRemaining] = useState(0)
  const [phone,setPhone] = useState('')
  const [code,setCode] = useState('')
  useEffect(()=>{setRemaining(sms?.retryAfterSeconds || 0)},[sms])
  useEffect(()=>{if(remaining<=0)return;const timer=setTimeout(()=>setRemaining(n=>Math.max(0,n-1)),1000);return()=>clearTimeout(timer)},[remaining])
  const verified = verification?.verified && verification.challengeId === sms?.challengeId
  return <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 space-y-6">
    <h1 className="text-3xl font-bold">{stageName}</h1>
    <p className="text-muted-foreground">{verified ? 'Phone verified. Choose your password to finish signup.' : sms?.challengeId ? 'Enter the SMS code to verify your phone. You will set your password next.' : 'First verify your phone number. Your artist identity is permanent.'}</p>
    {!verified && <form action={send} className="space-y-3">
      <label htmlFor="signup-phone">Phone number</label><Input id="signup-phone" name="phone" type="tel" autoComplete="tel" placeholder="0712 345 678" value={phone} onChange={e=>setPhone(e.target.value)} required />
      <Button disabled={sending || verifying || pending || remaining>0}>{sending ? 'Sending…' : remaining>0 ? `Resend in ${remaining}s` : sms?.challengeId ? 'Send a new code' : 'Verify phone'}</Button>
      {sms?.error && <p role="alert" className="text-red-400">{sms.error}</p>}{sms?.success && <p role="status">{sms.success}</p>}
    </form>}
    {sms?.challengeId && !verified && <form action={verify} className="space-y-3">
      <input type="hidden" name="challengeId" value={sms.challengeId} />
      <label htmlFor="signup-code">SMS code</label><Input id="signup-code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={e=>setCode(e.target.value)} required />
      {verification?.error && <p role="alert" className="text-red-400">{verification.error}</p>}
      <Button disabled={verifying || sending}>{verifying ? 'Verifying…' : 'Verify code'}</Button>
    </form>}
    {verified && <form action={signup} className="space-y-3">
      <input type="hidden" name="challengeId" value={verification.challengeId} />
      <label htmlFor="signup-password">Password</label><Input id="signup-password" name="password" type="password" autoComplete="new-password" minLength={10} maxLength={128} required />
      <label htmlFor="signup-confirm">Confirm password</label><Input id="signup-confirm" name="confirmPassword" type="password" autoComplete="new-password" minLength={10} maxLength={128} required />
      {state?.error && <p role="alert" className="text-red-400">{state.error}</p>}<Button disabled={pending}>{pending ? 'Creating account…' : 'Create artist account'}</Button>
    </form>}
  </div>
}
