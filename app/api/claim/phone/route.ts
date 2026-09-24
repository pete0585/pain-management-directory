import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// Table name is directory-specific; set LISTINGS_TABLE env var per deployment
const LISTINGS_TABLE = process.env.LISTINGS_TABLE ?? 'ibclc_listings'

export async function POST(request: NextRequest) {
  try {
    const { listingId, phone } = await request.json()
    if (!listingId || !phone) {
      return NextResponse.json({ error: 'listingId and phone are required' }, { status: 400 })
    }
    const supabase = await createServiceClient()
    await supabase
      .from(LISTINGS_TABLE)
      .update({ phone })
      .eq('id', listingId)
    return NextResponse.json({ success: true })
  } catch {
    // Best-effort — never block the user over phone capture
    return NextResponse.json({ success: true })
  }
}
