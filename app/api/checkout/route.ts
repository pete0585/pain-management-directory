import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const listingId = (body.listingId ?? body.listing_id) as string | undefined
  const tier = body.tier as string | undefined

  if (!listingId || !tier) {
    return NextResponse.json({ error: 'listing_id and tier required' }, { status: 400 })
  }

  const supabase = await createServiceClient()
  const { data: listing, error } = await supabase
    .from('pm_listings')
    .select('id, slug')
    .eq('id', listingId)
    .single()

  if (error || !listing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }

  const priceId = tier === 'featured'
    ? process.env.STRIPE_FEATURED_PRICE_ID!
    : process.env.STRIPE_VERIFIED_PRICE_ID!

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.painmanagementfinder.com'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${siteUrl}/doctor/${listing.slug}?upgraded=true`,
    cancel_url: `${siteUrl}/claim/${listingId}?verified=true`,
    metadata: { listing_id: listingId, tier },
    subscription_data: { metadata: { listing_id: listingId, tier } },
  })

  return NextResponse.json({ url: session.url })
}
