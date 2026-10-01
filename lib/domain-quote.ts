export const DOMAIN_QUOTE = {
  currentDomain: 'rieeng.co.ke',
  newDomain: 'rieng.com',
  amount: 2800,
  currency: 'KES',
  registrar: 'TrueHost',
} as const

export type DomainPaymentStatus = 'unpaid' | 'pending' | 'uncertain' | 'failed' | 'paid'
export type DomainPaymentSummary = {
  status: DomainPaymentStatus
  amount: number
  reference: string | null
  receipt: string | null
  phoneLast4: string | null
  note: string
}
