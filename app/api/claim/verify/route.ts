import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { listingId, token } = body as { listingId?: string; token?: string }

  if (!listingId || !token) {
    return NextResponse.json({ error: 'listingId and token required' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  const { data: claim } = await supabase
    .from('pm_claims')
    .select('id, listing_id, verified, expires_at')
    .eq('listing_id', listingId)
    .eq('token', token)
    .eq('verified', false)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!claim) {
    return NextResponse.json({ success: false, error: 'Invalid or expired verification link' }, { status: 400 })
  }

  // Mark claim as verified with verified_at timestamp
  await supabase
    .from('pm_claims')
    .update({ verified: true, verified_at: new Date().toISOString() })
    .eq('id', claim.id)

  // Mark listing as claimed
  const { data: listing } = await supabase
    .from('pm_listings')
    .update({ claimed: true, claimed_at: new Date().toISOString() })
    .eq('id', listingId)
    .select('slug')
    .single()

  return NextResponse.json({ success: true, slug: listing?.slug ?? null })
}
