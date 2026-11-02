import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email, amount, songTitle, songId, phone, callbackUrl } = await req.json()

    if (!email || !amount || !songTitle) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecret) {
      return NextResponse.json({ error: 'Paystack secret key is missing' }, { status: 500 })
    }

    const host = req.headers.get('host') || 'localhost:3000'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const defaultCallback = `${protocol}://${host}/other-artists?payment=success&trackId=${encodeURIComponent(songId || '')}`

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        // Paystack expects amount in kobo/pesewas (KES = amount * 100)
        amount: Math.round(Number(amount) * 100),
        currency: 'KES',
        phone: phone || undefined,
        metadata: {
          song_title: songTitle,
          song_id: songId,
          phone,
          custom_fields: [
            {
              display_name: 'Song',
              variable_name: 'song_title',
              value: songTitle,
            },
            {
              display_name: 'Phone',
              variable_name: 'phone',
              value: phone || 'N/A',
            },
          ],
        },
        callback_url: callbackUrl || defaultCallback,
        channels: ['card', 'mobile_money', 'ussd', 'bank_transfer'],
      }),
    })

    const data = await response.json()

    if (!data.status) {
      return NextResponse.json({ error: data.message || 'Payment initialization failed' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference: data.data.reference,
    })
  } catch (err) {
    console.error('Paystack init error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
