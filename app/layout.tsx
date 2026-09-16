import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import SmoothScroll from '@/components/SmoothScroll'
import { RadioProvider } from '@/context/RadioContext'
import FloatingRadioBar from '@/components/FloatingRadioBar'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'RIENG - Your Premium Music & Entertainment Platform',
  description: 'RIENG - The ultimate destination for curated music, live shows, and entertainment. Stream your favorite music and discover new artists.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/logo.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/logo.png',
        media: '(prefers-color-scheme: dark)',
      },
    ],
    apple: '/logo.png',
  },
  openGraph: {
    title: 'RIENG - Your Premium Music & Entertainment Platform',
    description: 'Stream premium music, live shows, and entertainment on RIENG',
    type: 'website',
    url: 'https://rieng-radio.com',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark bg-background" data-scroll-behavior="smooth">
      <body className="font-sans antialiased">
        <RadioProvider>
          <SmoothScroll />
          {children}
          <FloatingRadioBar />
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </RadioProvider>
      </body>
    </html>
  )
}
