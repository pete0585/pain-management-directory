import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ListingCard from '@/components/ListingCard'
import SearchBar from '@/components/SearchBar'
import { getCityListings } from '@/lib/data'
import { STATE_NAMES } from '@/lib/utils'
import { MapPin, ArrowRight } from 'lucide-react'

interface PageProps {
  params: Promise<{ 'city-state': string }>
}

function parseCityState(slug: string): { city: string; state: string } | null {
  const parts = slug.split('-')
  if (parts.length < 2) return null
  const state = parts[parts.length - 1].toUpperCase()
  const city = parts.slice(0, parts.length - 1).map(
    (w) => w.charAt(0).toUpperCase() + w.slice(1)
  ).join(' ')
  return { city, state }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { 'city-state': cityState } = await params
  const parsed = parseCityState(cityState)
  if (!parsed) return { title: 'City Not Found' }
  const { city, state } = parsed
  const stateName = STATE_NAMES[state] ?? state

  return {
    title: `Pain Management Doctors in ${city}, ${stateName} — Board-Certified Specialists`,
    description: `Find board-certified pain management doctors in ${city}, ${stateName}. Filter by specialty, procedures offered, and VA Community Care acceptance. Free to search.`,
    alternates: { canonical: `/pain-management-doctors/${cityState}` },
  }
}

export default async function CityPage({ params }: PageProps) {
  const { 'city-state': cityState } = await params
  const parsed = parseCityState(cityState)

  if (!parsed) notFound()

  const { city, state } = parsed
  const listings = await getCityListings(city, state).catch(() => [])
  const stateName = STATE_NAMES[state] ?? state

  if (listings.length === 0) notFound()

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 mb-6 flex flex-wrap gap-1">
        <Link href="/" className="hover:text-navy">Home</Link>
        <span>/</span>
        <Link href="/listings" className="hover:text-navy">Specialists</Link>
        <span>/</span>
        <Link href={`/listings?state=${state}`} className="hover:text-navy">{stateName}</Link>
        <span>/</span>
        <span className="text-slate">{city}</span>
      </nav>

      <div className="mb-8">
        <div className="flex items-center gap-2 text-teal text-sm font-medium mb-2">
          <MapPin className="h-4 w-4" aria-hidden="true" />
          {city}, {stateName}
        </div>
        <h1 className="text-3xl font-bold text-slate">
          Pain Management Doctors in {city}, {stateName}
        </h1>
        <p className="text-gray-400 mt-2">
          {listings.length} board-certified pain management specialist{listings.length !== 1 ? 's' : ''} in {city}, {state}.
        </p>
      </div>

      <div className="mb-8">
        <SearchBar defaultCity={city} defaultState={state} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      {/* SEO content block */}
      <section className="mt-12 rounded-2xl bg-white border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-slate mb-4">Finding Pain Management Care in {city}, {stateName}</h2>
        <div className="prose prose-sm max-w-none text-gray-500 leading-relaxed">
          <p>
            Chronic pain affects approximately 24% of adults nationwide, and {city} residents have access to a range of board-certified pain management physicians and clinics.
            The specialists listed above include interventional pain medicine physicians, anesthesiologists specializing in pain management,
            and physiatrists (physical medicine & rehabilitation doctors) who focus on pain.
          </p>
          <p className="mt-3">
            Many {city} pain management practices offer both conservative treatments — like physical therapy referrals and medication management —
            and interventional procedures such as epidural steroid injections, radiofrequency ablation (RFA), and spinal cord stimulation (SCS).
            If you&apos;re a veteran with VA Community Care eligibility, filter the listings above to find specialists in {city} who accept VA referrals.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/listings?state=${state}&va=true`} className="btn-secondary text-sm px-4 py-2">
            VA Community Care in {state} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link href={`/listings?state=${state}`} className="btn-secondary text-sm px-4 py-2">
            All {stateName} specialists <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  )
}
