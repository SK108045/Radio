import type { Metadata } from 'next'
import DomainPayment from '../domain-payment/payment'

export const metadata: Metadata = {
  title: 'KSh 1 M-Pesa test · Rieng',
  description: 'Send a real KSh 1 M-Pesa payment to test the Rieng Swifta checkout.',
  robots: { index: false, follow: false },
}

export default function PaymentTestPage() { return <DomainPayment testMode /> }
