import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ListingCard from '@/components/ListingCard'
import SearchBar from '@/components/SearchBar'
import { browseListings } from '@/lib/data'
import { CONDITIONS } from '@/lib/types'
import { ArrowRight } from 'lucide-react'

interface PageProps {
  params: Promise<{ condition: string }>
}

export async function generateStaticParams() {
  return CONDITIONS.map((c) => ({ condition: c.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { condition } = await params
  const cond = CONDITIONS.find((c) => c.slug === condition)
  if (!cond) return { title: 'Condition Not Found' }

  return {
    title: `Find a Pain Management Doctor for ${cond.label} | PainManagementFinder`,
    description: `Find board-certified pain management specialists who treat ${cond.label}. Search by location and filter by procedures offered, VA Community Care acceptance, and more.`,
  }
}

export default async function ConditionPage({ params }: PageProps) {
  const { condition } = await params
  const cond = CONDITIONS.find((c) => c.slug === condition)

  if (!cond) notFound()

  const { listings } = await browseListings({ condition, page: 1 }).catch(() => ({ listings: [], total: 0 }))

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 mb-6 flex flex-wrap gap-1">
        <Link href="/" className="hover:text-navy">Home</Link>
        <span>/</span>
        <Link href="/chronic-pain-conditions" className="hover:text-navy">Conditions</Link>
        <span>/</span>
        <span className="text-slate">{cond.label}</span>
      </nav>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{cond.icon}</span>
          <h1 className="text-3xl font-bold text-slate">
            Find a Pain Specialist for {cond.label}
          </h1>
        </div>
        <p className="text-gray-400 max-w-2xl leading-relaxed">
          Board-certified pain management doctors who specialize in treating {cond.label.toLowerCase()}.
          {listings.length > 0 && ` ${listings.length} specialists found nationwide.`}
        </p>
      </div>

      <div className="mb-8">
        <SearchBar size="large" />
      </div>

      {listings.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.slice(0, 12).map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href={`/listings?condition=${condition}`} className="btn-primary">
              See all {cond.label} specialists <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </>
      ) : (
        <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center">
          <p className="text-2xl mb-3">{cond.icon}</p>
          <h2 className="text-lg font-semibold text-slate mb-2">No verified specialists yet for {cond.label}</h2>
          <p className="text-gray-400 text-sm mb-4">Try browsing all pain management doctors or submitting your own practice.</p>
          <Link href="/listings" className="btn-primary text-sm">Browse All Specialists</Link>
        </div>
      )}

      {/* Other conditions */}
      <section className="mt-12">
        <h2 className="text-lg font-semibold text-slate mb-4">Browse Other Conditions</h2>
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.filter((c) => c.slug !== condition).map((c) => (
            <Link
              key={c.slug}
              href={`/chronic-pain-conditions/${c.slug}`}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 hover:border-navy-200 hover:text-navy transition-colors"
            >
              {c.icon} {c.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
