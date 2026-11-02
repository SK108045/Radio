import type { Metadata } from 'next'
import BobTestCheckout from '@/components/BobTestCheckout'

export const metadata: Metadata = {
  title: 'KSh 1 BoB Swifta + Sozuri test | RIENG254',
  description: 'Test BoB M-Pesa checkout and confirmation SMS with a real KSh 1 payment.',
  robots: { index: false, follow: false },
}

export default function Page() { return <BobTestCheckout /> }
