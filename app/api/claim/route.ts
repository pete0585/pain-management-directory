import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { listingId, email } = body as { listingId?: string; email?: string }

  if (!listingId || !email) {
    return NextResponse.json({ error: 'listingId and email required' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  const { data: listing } = await supabase
    .from('pm_listings')
    .select('id, slug, first_name, last_name, business_name, city, state')
    .eq('id', listingId)
    .single()

  if (!listing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }

  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()

  await supabase.from('pm_claims').insert({
    listing_id: listingId,
    email,
    token,
    verified: false,
    expires_at: expiresAt,
  })

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.painmanagementfinder.com'
  const verifyUrl = `${siteUrl}/claim/${listingId}?token=${token}`

  // Send verification email via Resend
  const resendKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'no-reply@mail.painmanagementfinder.com'

  if (resendKey) {
    const name = listing.first_name
      ? `${listing.first_name} ${listing.last_name}`
      : listing.business_name ?? 'there'

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `PainManagementFinder <${fromEmail}>`,
        to: [email],
        subject: `Verify your listing on PainManagementFinder.com`,
        html: `
          <p>Hi ${name},</p>
          <p>Click the link below to verify and claim your listing on PainManagementFinder.com:</p>
          <p><a href="${verifyUrl}" style="color:#2A9D8F;font-weight:600;">Verify My Listing</a></p>
          <p>This link expires in 72 hours.</p>
          <p>After verification, you can upgrade to a Verified ($149/yr) or Featured ($299/yr) listing for priority placement.</p>
          <p>— The PainManagementFinder Team</p>
        `,
      }),
    })
  }

  return NextResponse.json({ success: true })
}
