import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NICHE = 'pain-management' as const
const DIRECTORY_SLUG = 'pain-management-directory' as const
const NEWSLETTER_NAME = 'The Pain Care Compass Letter' as const
const CONFIRM_URL_BASE = 'https://www.findpainmanagement.com/newsletter/confirm'
const DASHBOARD_URL = 'https://aidam.thestrategicveteran.com'

export async function POST(req: NextRequest) {
  let email: string, first_name: string | undefined
  try {
    const body = await req.json()
    email = body.email
    first_name = body.first_name
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: 'Valid email address required' }, { status: 400 })
  }

  const token = process.env.NEWSLETTER_SUBMIT_TOKEN
  if (!token) {
    console.error('NEWSLETTER_SUBMIT_TOKEN not configured')
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 })
  }

  try {
    const res = await fetch(`${DASHBOARD_URL}/api/newsletter/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        first_name: first_name?.trim() || undefined,
        niche: NICHE,
        directory_slug: DIRECTORY_SLUG,
        newsletter_name: NEWSLETTER_NAME,
        confirm_url_base: CONFIRM_URL_BASE,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json({ error: data.error ?? 'Subscription failed' }, { status: res.status })
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Newsletter submit error:', e)
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 })
  }
}
