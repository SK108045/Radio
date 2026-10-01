import type { Metadata } from 'next'
import DomainPayment from './payment'

export const metadata: Metadata = {
  title: 'Domain payment · Rieng',
  description: 'KSh 2,800 payment request to switch Rieng from rieeng.co.ke to rieng.com, with TrueHost as the domain registrar.',
  robots: { index: false, follow: false },
}

export default function DomainPaymentPage() { return <DomainPayment /> }
