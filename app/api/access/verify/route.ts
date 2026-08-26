import { NextRequest, NextResponse } from 'next/server'
import { create15MinAccessToken } from '@/lib/accessTokens'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { reference, trackId, phone } = await req.json()

    if (!reference || !trackId) {
      return NextResponse.json(
        { error: 'Missing reference or trackId' },
        { status: 400 }
      )
    }

    let paidAmountKsh: number | null = null
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY

    // If Paystack Secret Key is configured, verify with Paystack
    if (paystackSecret && !paystackSecret.includes('your-secret-key')) {
      try {
        const verifyRes = await fetch(
          `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
          {
            headers: {
              Authorization: `Bearer ${paystackSecret}`,
            },
          }
        )

        const verifyData = await verifyRes.json()

        if (!verifyData.status || verifyData.data?.status !== 'success') {
          return NextResponse.json(
            { error: 'Payment verification failed on Paystack' },
            { status: 402 }
          )
        }

        if (verifyData.data?.amount) {
          paidAmountKsh = Math.round(Number(verifyData.data.amount) / 100)
        }
      } catch (paystackErr) {
        console.warn('Paystack API check error, granting token for valid reference:', paystackErr)
      }
    }

    // ── Log Purchase in Supabase track_performance ──
    try {
      // 1. Fetch track details
      const { data: track } = await supabase
        .from('tracks')
        .select('id, price_ksh, artist_id')
        .eq('id', trackId)
        .maybeSingle()

      const amountToAdd = paidAmountKsh ?? Number(track?.price_ksh ?? 0)

      // 2. Determine current metric month
      const now = new Date()
      const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

      // 3. Check existing performance row for this track and month
      const { data: existingPerf } = await supabase
        .from('track_performance')
        .select('id, streams, downloads, revenue_ksh')
        .eq('track_id', trackId)
        .eq('metric_month', currentMonthStr)
        .maybeSingle()

      if (existingPerf) {
        await supabase
          .from('track_performance')
          .update({
            streams: (existingPerf.streams || 0) + 1,
            revenue_ksh: (Number(existingPerf.revenue_ksh) || 0) + amountToAdd,
          })
          .eq('id', existingPerf.id)
      } else {
        await supabase.from('track_performance').insert({
          track_id: trackId,
          metric_month: currentMonthStr,
          streams: 1,
          downloads: 0,
          revenue_ksh: amountToAdd,
        })
      }
    } catch (logErr) {
      console.warn('Failed to log track performance metrics:', logErr)
    }

    // Generate 15-minute access token
    const { token, expiresAt } = create15MinAccessToken(trackId, reference, phone)

    return NextResponse.json({
      success: true,
      token,
      expiresAt,
      message: '15-minute full access pass activated and logged in artist portal!',
    })
  } catch (error) {
    console.error('Access verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
