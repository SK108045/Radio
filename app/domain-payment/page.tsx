import type { Metadata } from 'next'
import DomainPayment from './payment'

export const metadata: Metadata = {
  title: 'Domain payment · Rieng',
  description: 'KSh 5,000 payment request to switch Rieng from rieng254.com to Rieng.ke, with TrueHost as the domain registrar.',
  robots: { index: false, follow: false },
}

export default function DomainPaymentPage() { return <DomainPayment /> }
