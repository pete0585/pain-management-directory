import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { first_name, last_name, business_name, npi_number, specialty_label,
    practice_address, city, state, zip, phone, email, website_url, bio,
    va_community_care, accepting_new_patients } = body as Record<string, string | boolean>

  if (!first_name || !last_name || !city || !state || !phone || !email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  // Generate unique slug
  const baseSlug = slugify(`${first_name} ${last_name} ${specialty_label ?? 'pain'} ${city} ${state}`)
  let slug = baseSlug
  let attempt = 0
  while (true) {
    const { data: existing } = await supabase
      .from('pm_listings')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (!existing) break
    attempt++
    slug = `${baseSlug}-${attempt}`
  }

  const { error } = await supabase.from('pm_listings').insert({
    first_name,
    last_name,
    business_name: business_name || null,
    npi_number: npi_number || null,
    specialty_label: specialty_label || null,
    practice_address,
    city,
    state: (state as string).toUpperCase(),
    zip: zip || null,
    phone,
    email,
    website_url: website_url || null,
    bio: bio || null,
    va_community_care: !!va_community_care,
    accepting_new_patients: accepting_new_patients !== false,
    listing_tier: 'free',
    listing_tier_rank: 0,
    source: 'self',
    is_active: true,
    is_approved: false,
    slug,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, slug })
}
