import { createServiceClient, createStaticClient } from '@/lib/supabase/server'
import type { PMListing } from '@/lib/types'

const TABLE = 'pm_listings'

export async function getFeaturedListings(limit = 6): Promise<PMListing[]> {
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('is_active', true)
    .eq('is_approved', true)
    .in('listing_tier', ['featured', 'verified'])
    .order('listing_tier_rank', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as PMListing[]
}

export async function getTotalCount(): Promise<number> {
  const supabase = createStaticClient()
  const { count } = await supabase
    .from(TABLE)
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
    .eq('is_approved', true)

  return count ?? 0
}

export async function getListingBySlug(slug: string): Promise<PMListing | null> {
  const supabase = await createServiceClient()
  const { data } = await supabase
    .from(TABLE)
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  return (data ?? null) as PMListing | null
}

export async function getListingById(id: string): Promise<PMListing | null> {
  const supabase = await createServiceClient()
  const { data } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single()

  return (data ?? null) as PMListing | null
}

export interface BrowseFilters {
  city?: string
  state?: string
  specialty?: string
  condition?: string
  procedure?: string
  va?: boolean
  accepting?: boolean
  tier?: string
  q?: string
  page?: number
}

export async function browseListings(filters: BrowseFilters): Promise<{ listings: PMListing[]; total: number }> {
  const supabase = createStaticClient()
  const page = filters.page ?? 1
  const pageSize = 20
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from(TABLE)
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .eq('is_approved', true)

  if (filters.state) query = query.ilike('state', filters.state)
  if (filters.city) query = query.ilike('city', `%${filters.city}%`)
  if (filters.va) query = query.eq('va_community_care', true)
  if (filters.accepting) query = query.eq('accepting_new_patients', true)
  if (filters.tier) query = query.eq('listing_tier', filters.tier)
  if (filters.specialty) query = query.ilike('specialty_label', `%${filters.specialty}%`)
  if (filters.condition) query = query.contains('conditions_treated', [filters.condition])
  if (filters.procedure) query = query.contains('procedures_offered', [filters.procedure])
  if (filters.q) {
    query = query.textSearch('search_vector', filters.q, { type: 'websearch' })
  }

  const { data, count, error } = await query
    .order('listing_tier_rank', { ascending: false })
    .order('last_name', { ascending: true })
    .range(from, to)

  if (error) throw error
  return { listings: (data ?? []) as PMListing[], total: count ?? 0 }
}

export async function getCityListings(city: string, state: string): Promise<PMListing[]> {
  const supabase = createStaticClient()
  const { data } = await supabase
    .from(TABLE)
    .select('*')
    .eq('is_active', true)
    .eq('is_approved', true)
    .ilike('city', city)
    .ilike('state', state)
    .order('listing_tier_rank', { ascending: false })
    .order('last_name', { ascending: true })
    .limit(50)

  return (data ?? []) as PMListing[]
}

export async function getStateCounts(): Promise<Record<string, number>> {
  const supabase = createStaticClient()
  const { data } = await supabase
    .from(TABLE)
    .select('state')
    .eq('is_active', true)
    .eq('is_approved', true)

  const counts: Record<string, number> = {}
  for (const row of data ?? []) {
    counts[row.state] = (counts[row.state] ?? 0) + 1
  }
  return counts
}

export async function getAllSlugs(): Promise<string[]> {
  const supabase = createStaticClient()
  const { data } = await supabase
    .from(TABLE)
    .select('slug')
    .eq('is_active', true)
    .eq('is_approved', true)

  return (data ?? []).map((r) => r.slug as string)
}

export async function getTopCities(limit = 24): Promise<Array<{ city: string; state: string; count: number }>> {
  const supabase = createStaticClient()
  const { data } = await supabase
    .from(TABLE)
    .select('city, state')
    .eq('is_active', true)
    .eq('is_approved', true)

  const counts: Record<string, { city: string; state: string; count: number }> = {}
  for (const row of data ?? []) {
    const key = `${row.city}|${row.state}`
    if (!counts[key]) counts[key] = { city: row.city, state: row.state, count: 0 }
    counts[key].count++
  }

  return Object.values(counts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}
