import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  let payload: Record<string, unknown>

  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Resend delivers email.received events via Svix envelope: { type, data: { from, to, subject, text, html } }
  const emailData = (payload.type === 'email.received' && payload.data && typeof payload.data === 'object')
    ? (payload.data as Record<string, unknown>)
    : payload

  const fromRaw = emailData.from as string | undefined
  const subject = (emailData.subject as string | undefined) ?? ''
  const bodyText = (emailData.text as string | undefined) ?? ''
  const bodyHtml = (emailData.html as string | undefined) ?? ''

  if (!fromRaw) {
    return NextResponse.json({ error: 'Missing from address' }, { status: 400 })
  }

  const fromMatch = fromRaw.match(/^(?:"?([^"<]+)"?\s)?<?([^\s>]+@[^\s>]+)>?$/)
  const fromName = fromMatch?.[1]?.trim() ?? ''
  const fromEmail = fromMatch?.[2]?.trim() ?? fromRaw

  let listingId: string | null = null
  let listingSlug: string | null = null

  const xListingHeader = (emailData.headers as Record<string, string> | undefined)?.['x-listing-id']
  if (xListingHeader) {
    listingId = xListingHeader
  }

  if (!listingId && bodyText) {
    const slugMatch = bodyText.match(/painmanagementfinder\.com\/doctor\/([\w-]+)/)
    if (slugMatch) listingSlug = slugMatch[1]
  }

  const supabase = await createServiceClient()

  await supabase.from('inbound_emails').insert({
    directory: 'pain-management',
    from_email: fromEmail,
    from_name: fromName,
    subject,
    body_text: bodyText,
    body_html: bodyHtml,
    listing_id: listingId,
    listing_slug: listingSlug,
    processed: false,
  })

  return NextResponse.json({ received: true })
}
