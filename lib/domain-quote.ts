export const DOMAIN_QUOTE = {
  currentDomain: 'rieng254.com',
  newDomain: 'Rieng.ke',
  amount: 5000,
  currency: 'KES',
  registrar: 'TrueHost',
} as const

export const PAYMENT_TEST_AMOUNT = 1
export type PaymentPurpose = 'domain' | 'test'
export function paymentAmount(purpose: PaymentPurpose) {
  return purpose === 'test' ? PAYMENT_TEST_AMOUNT : DOMAIN_QUOTE.amount
}

export type DomainPaymentStatus = 'unpaid' | 'pending' | 'uncertain' | 'failed' | 'paid'
export type DomainPaymentSummary = {
  status: DomainPaymentStatus
  amount: number
  reference: string | null
  receipt: string | null
  phoneLast4: string | null
  note: string
}
