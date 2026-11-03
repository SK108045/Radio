'use client'
import { useActionState } from 'react'
import { requestPayoutAction } from '@/app/sales/actions'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export function RequestPayoutButton({ available, hasPending }: { available: number; hasPending: boolean }) {
  const [state, action, pending] = useActionState(requestPayoutAction, null)
  const disabled = pending || available <= 0 || hasPending || !!state?.success

  return <div className="space-y-3">
    <form action={action}>
      <Button type="submit" disabled={disabled} className="min-w-48">
        {pending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing…</> : hasPending || state?.success ? 'Payment request pending' : 'Request payment'}
      </Button>
    </form>
    {state?.success && <p role="status" className="text-sm text-emerald-500">{state.success}</p>}
    {state?.error && <p role="alert" className="text-sm text-red-400">{state.error}</p>}
    {!state?.success && hasPending && <p className="text-sm text-muted-foreground">Your request is being processed. Please allow up to one hour for payment.</p>}
    {!state?.success && !hasPending && available <= 0 && <p className="text-sm text-muted-foreground">No available artist earnings to request yet.</p>}
  </div>
}
