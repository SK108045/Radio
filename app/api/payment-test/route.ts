import { createPaymentHandlers } from '@/lib/payment-route'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

export const { GET, POST } = createPaymentHandlers('test')
