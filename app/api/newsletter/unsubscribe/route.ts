import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// RFC 8058 one-click unsubscribe support
export async function POST(req: NextRequest) {
  let email: string, niche: string

  // Handle List-Unsubscribe-Post (RFC 8058)
  const contentType = req.headers.get('content-type') ?? ''
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const text = await req.text()
    const params = new URLSearchParams(text)
    if (params.get('List-Unsubscribe') === 'One-Click') {
      const url = new URL(req.url)
      email = url.searchParams.get('email') ?? ''
      niche = 'pain-management'
    } else {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
  } else {
    try {
      const body = await req.json()
      email = body.email
      niche = body.niche ?? 'pain-management'
    } catch {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
  }

  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const token = process.env.NEWSLETTER_SUBMIT_TOKEN
  if (!token) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })

  try {
    const res = await fetch('https://aidam.studiozerohq.com/api/newsletter/unsub', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ email, niche }),
    })
    if (!res.ok) {
      const data = await res.json()
      return NextResponse.json({ error: data.error ?? 'Unsubscribe failed' }, { status: res.status })
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Unsubscribe error:', e)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
