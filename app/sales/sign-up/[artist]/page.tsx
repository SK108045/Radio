import { artistSlug } from '@/lib/sales-security'
import { adminDb } from '@/lib/supabase-admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { SignupForm } from './signup-form'
export const dynamic = 'force-dynamic'
export default async function SignupPage({ params }: { params: Promise<{ artist: string }> }) {
  const slug = artistSlug((await params).artist)
  if (!slug) notFound()
  const { data, error } = await adminDb().from('sales_artist_registry').select('stage_name,claimed_at,is_test,demo_signup_enabled').eq('slug', slug).single()
  if (error) throw new Error('Artist signup is unavailable. Apply the sales migration.')
  if (!data || data.claimed_at) return <main className="min-h-screen flex flex-col items-center justify-center gap-4"><h1 className="text-2xl font-bold">This signup link has been used</h1><Link href="/sales/login" className="text-primary">Sign in with your phone number</Link></main>
  return <main className="min-h-screen flex items-center justify-center p-6"><SignupForm slug={slug} stageName={data.stage_name} demoSignup={(slug==='metro_stunna' || slug==='swatt' || (slug==='test_artist' && data.is_test)) && data.demo_signup_enabled} /></main>
}
