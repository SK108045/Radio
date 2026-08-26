import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/accessTokens'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileUrl = searchParams.get('url')
    const fileName = searchParams.get('name')
    const token = searchParams.get('token')

    if (!fileUrl || !fileName) {
      return NextResponse.json(
        { error: 'Missing url or name parameter' },
        { status: 400 }
      )
    }

    // If a token is provided, verify it hasn't expired
    if (token) {
      const verification = verifyAccessToken(token)
      if (!verification.valid) {
        return NextResponse.json(
          { error: verification.error || 'Access token expired or invalid' },
          { status: 403 }
        )
      }
    }

    // Fetch the file from Supabase
    const response = await fetch(fileUrl)
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch file from storage' },
        { status: response.status }
      )
    }

    const buffer = await response.arrayBuffer()

    // Return with proper download headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': buffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
