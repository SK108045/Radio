import { NextResponse } from 'next/server'
export async function GET() { return NextResponse.json({ error: 'Purchased tracks are available for streaming only.' }, { status: 410 }) }
