import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Artist Portal - Rieng',
  description: 'Manage your music, sales, and performance on Rieng.',
}

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
