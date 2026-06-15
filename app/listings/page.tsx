import type { Metadata } from 'next'
import { Suspense } from 'react'
import ListingCard from '@/components/ListingCard'
import FilterSidebar from '@/components/FilterSidebar'
import SearchBar from '@/components/SearchBar'
import { browseListings } from '@/lib/data'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Browse Pain Management Specialists',
  description: 'Search all board-certified pain management doctors and clinics. Filter by specialty, condition, treatment, VA Community Care acceptance, and location.',
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[]>>
}

export default async function ListingsPage({ searchParams }: PageProps) {
  const params = await searchParams

  const getString = (val: string | string[] | undefined) => (Array.isArray(val) ? val[0] : val) ?? ''

  const filters = {
    city: getString(params.city),
    state: getString(params.state),
    specialty: getString(params.specialty),
    condition: getString(params.condition),
    procedure: getString(params.procedure),
    va: getString(params.va) === 'true',
    accepting: getString(params.accepting) === 'true',
    tier: getString(params.tier),
    q: getString(params.q),
    page: parseInt(getString(params.page) || '1', 10),
  }

  const { listings, total } = await browseListings(filters).catch(() => ({ listings: [], total: 0 }))
  const pageSize = 20
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = filters.page

  function buildPageUrl(page: number) {
    const p = new URLSearchParams()
    if (filters.city) p.set('city', filters.city)
    if (filters.state) p.set('state', filters.state)
    if (filters.specialty) p.set('specialty', filters.specialty)
    if (filters.condition) p.set('condition', filters.condition)
    if (filters.procedure) p.set('procedure', filters.procedure)
    if (filters.va) p.set('va', 'true')
    if (filters.accepting) p.set('accepting', 'true')
    if (filters.tier) p.set('tier', filters.tier)
    if (filters.q) p.set('q', filters.q)
    p.set('page', String(page))
    return `/listings?${p.toString()}`
  }

  const locationLabel = [filters.city, filters.state].filter(Boolean).join(', ')

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate">
          {locationLabel ? `Pain Management Specialists in ${locationLabel}` : 'Browse Pain Management Specialists'}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {total > 0 ? `${total.toLocaleString()} specialists found` : 'No specialists matched your filters'}
        </p>
      </div>

      <div className="mb-6">
        <SearchBar defaultCity={filters.city} defaultState={filters.state} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <Suspense>
            <FilterSidebar />
          </Suspense>
        </aside>

        <div className="lg:col-span-3">
          {listings.length === 0 ? (
            <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center">
              <p className="text-2xl mb-3">🔍</p>
              <h2 className="text-lg font-semibold text-slate mb-2">No specialists found</h2>
              <p className="text-gray-400 text-sm mb-4">Try broadening your search — remove a filter or search a different state.</p>
              <Link href="/listings" className="btn-primary text-sm">Clear all filters</Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  {currentPage > 1 && (
                    <Link href={buildPageUrl(currentPage - 1)} className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-navy hover:bg-gray-50">
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Prev
                    </Link>
                  )}
                  <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
                  {currentPage < totalPages && (
                    <Link href={buildPageUrl(currentPage + 1)} className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-navy hover:bg-gray-50">
                      Next <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
