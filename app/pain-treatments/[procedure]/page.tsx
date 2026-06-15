import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ListingCard from '@/components/ListingCard'
import SearchBar from '@/components/SearchBar'
import { browseListings } from '@/lib/data'
import { PROCEDURES } from '@/lib/types'
import { ArrowRight } from 'lucide-react'

interface PageProps {
  params: Promise<{ procedure: string }>
}

export async function generateStaticParams() {
  return PROCEDURES.map((p) => ({ procedure: p.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { procedure } = await params
  const proc = PROCEDURES.find((p) => p.slug === procedure)
  if (!proc) return { title: 'Treatment Not Found' }

  return {
    title: `Find a Doctor Who Performs ${proc.label} Near You | PainManagementFinder`,
    description: `Find board-certified pain management specialists who offer ${proc.label}. Search by location and filter by VA Community Care acceptance and other criteria.`,
  }
}

export default async function ProcedurePage({ params }: PageProps) {
  const { procedure } = await params
  const proc = PROCEDURES.find((p) => p.slug === procedure)

  if (!proc) notFound()

  const { listings } = await browseListings({ procedure, page: 1 }).catch(() => ({ listings: [], total: 0 }))

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 mb-6 flex flex-wrap gap-1">
        <Link href="/" className="hover:text-navy">Home</Link>
        <span>/</span>
        <Link href="/pain-treatments" className="hover:text-navy">Treatments</Link>
        <span>/</span>
        <span className="text-slate">{proc.label}</span>
      </nav>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{proc.icon}</span>
          <h1 className="text-3xl font-bold text-slate">
            Find a Doctor Who Performs {proc.label}
          </h1>
        </div>
        <p className="text-gray-400 max-w-2xl leading-relaxed">
          {proc.description}. Find a board-certified pain management specialist who offers {proc.label.toLowerCase()} near you.
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
            <Link href={`/listings?procedure=${procedure}`} className="btn-primary">
              See all {proc.label} doctors <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </>
      ) : (
        <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center">
          <p className="text-2xl mb-3">{proc.icon}</p>
          <h2 className="text-lg font-semibold text-slate mb-2">No specialists listed for {proc.label} yet</h2>
          <p className="text-gray-400 text-sm mb-4">Browse all pain management doctors and contact them about this procedure.</p>
          <Link href="/listings" className="btn-primary text-sm">Browse All Specialists</Link>
        </div>
      )}

      {/* Other procedures */}
      <section className="mt-12">
        <h2 className="text-lg font-semibold text-slate mb-4">Browse Other Treatments</h2>
        <div className="flex flex-wrap gap-2">
          {PROCEDURES.filter((p) => p.slug !== procedure).map((p) => (
            <Link
              key={p.slug}
              href={`/pain-treatments/${p.slug}`}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 hover:border-teal-200 hover:text-teal transition-colors"
            >
              {p.icon} {p.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
