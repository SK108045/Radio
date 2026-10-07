import { NextResponse } from 'next/server'
export async function POST() { return NextResponse.json({ error: 'Use the Swifta checkout on /dj-mix-sales.' }, { status: 410 }) }
