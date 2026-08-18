import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Shield, Award, Users, CheckCircle, Star, MapPin } from 'lucide-react'
import SearchBar from '@/components/SearchBar'
import ListingCard from '@/components/ListingCard'
import { getFeaturedListings, getTotalCount, getTopCities } from '@/lib/data'
import { SPECIALTIES, CONDITIONS, PROCEDURES } from '@/lib/types'

export const metadata: Metadata = {
  title: 'PainManagementFinder.com — Find a Board-Certified Pain Specialist Near You',
  description:
    'Find board-certified pain management doctors near you. Filter by VA Community Care, specialty, and conditions treated. 15,000+ physicians nationwide.',
}

export default async function HomePage() {
  const [featured, listingCount, topCities] = await Promise.all([
    getFeaturedListings(6).catch(() => []),
    getTotalCount().catch(() => 0),
    getTopCities(12).catch(() => []),
  ])

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-hero pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-navy-50 border border-navy-100 px-4 py-2 text-sm text-navy mb-6">
            <Shield className="h-4 w-4 text-navy" aria-hidden="true" />
            <span>
              {listingCount > 0
                ? `${listingCount.toLocaleString()} pain management specialists nationwide`
                : 'The first neutral, patient-facing pain management directory'}
            </span>
          </div>

          <h1 className="text-4xl font-bold text-slate leading-tight sm:text-5xl tracking-tight text-balance">
            Find a pain specialist{' '}
            <span className="text-navy">who takes your pain seriously</span>
          </h1>

          <p className="mt-5 text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            80M Americans live with chronic pain. This is the directory they&apos;ve been waiting for — neutral, searchable by condition and procedure, with a dedicated filter for VA Community Care.
          </p>

          <div className="mt-8 flex justify-center">
            <SearchBar size="large" />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-navy" aria-hidden="true" />
              VA Community Care filter
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="h-4 w-4 text-amber" aria-hidden="true" />
              ABPM board certification
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-teal" aria-hidden="true" />
              Procedure-specific search
            </span>
          </div>
        </div>
      </section>

      {/* Why this directory */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-50 mx-auto mb-4">
                <Shield className="h-7 w-7 text-navy" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-slate mb-2">Veteran-Friendly Filters</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                VA wait times for pain management average 6–12 months. Filter instantly for specialists who accept VA Community Care — the only directory with this dedicated filter.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 mx-auto mb-4">
                <Award className="h-7 w-7 text-amber" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-slate mb-2">No Device Bias</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Pain.com shows only Boston Scientific&apos;s device customers. ASIPP&apos;s finder is members-only. We&apos;re completely neutral — every board-certified specialist, no paid placement bias.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 mx-auto mb-4">
                <CheckCircle className="h-7 w-7 text-teal" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-slate mb-2">Search by Procedure</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Already know what treatment you need? Filter for specialists who perform spinal cord stimulation, RFA, ketamine infusion, or epidural injections specifically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by specialty */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-offwhite">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-10">
            <h2 className="section-heading">Browse by Specialty</h2>
            <p className="section-subheading">Find the right type of pain management doctor for your condition.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SPECIALTIES.map((s) => (
              <Link
                key={s.slug}
                href={`/listings?specialty=${s.slug}`}
                className="card p-5 flex items-center gap-3 group hover:border-navy-200"
              >
                <span className="text-2xl">{s.icon}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate group-hover:text-navy transition-colors leading-tight">{s.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5 hidden sm:block truncate">{s.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-navy ml-auto flex-shrink-0 transition-colors" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Conditions */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-10">
            <h2 className="section-heading">Find a Specialist for Your Condition</h2>
            <p className="section-subheading">Search by the specific condition driving your pain.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CONDITIONS.map((c) => (
              <Link
                key={c.slug}
                href={`/chronic-pain-conditions/${c.slug}`}
                className="rounded-2xl bg-offwhite border border-gray-100 p-4 text-center hover:border-navy-200 hover:shadow-soft transition-all group"
              >
                <span className="text-2xl block mb-2">{c.icon}</span>
                <p className="text-sm font-semibold text-slate group-hover:text-navy transition-colors">{c.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Procedures */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-offwhite">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-10">
            <h2 className="section-heading">Search by Treatment</h2>
            <p className="section-subheading">Know what procedure you need? Find a doctor who performs it.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PROCEDURES.map((p) => (
              <Link
                key={p.slug}
                href={`/pain-treatments/${p.slug}`}
                className="card p-4 text-center group hover:border-teal-200"
              >
                <span className="text-2xl block mb-2">{p.icon}</span>
                <p className="text-sm font-semibold text-slate group-hover:text-teal transition-colors">{p.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured listings */}
      {featured.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="section-heading">Featured Specialists</h2>
                <p className="section-subheading">Verified practitioners accepting new patients.</p>
              </div>
              <Link href="/listings" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-teal">
                View all <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((listing) => (
                <ListingCard key={listing.id} listing={listing} featured />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Cities */}
      {topCities.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-offwhite">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-10">
              <h2 className="section-heading">Find a Specialist in Your City</h2>
              <p className="section-subheading">Pain management doctors in every major metro area.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {topCities.map((city) => (
                <Link
                  key={`${city.city}-${city.state}`}
                  href={`/pain-management-doctors/${city.city.toLowerCase().replace(/\s+/g, '-')}-${city.state.toLowerCase()}`}
                  className="rounded-xl bg-white px-3 py-3.5 text-center shadow-soft hover:shadow-card transition-shadow group"
                >
                  <p className="text-sm font-semibold text-slate group-hover:text-navy transition-colors">{city.city}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{city.state}</p>
                  <p className="text-xs text-gray-300 mt-0.5">{city.count} doctors</p>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/listings" className="btn-secondary">
                Browse all specialists <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Veteran section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-navy">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm text-white/80 mb-6">
            <Shield className="h-4 w-4" aria-hidden="true" /> For Veterans
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">
            13 years in the Army. 4 combat deployments. I know what chronic pain does to veterans.
          </h2>
          <p className="text-navy-200 text-base mb-6 leading-relaxed">
            VA wait times for pain management average 6–12 months. Veterans with VA Community Care eligibility can see outside providers — but finding one who accepts it is nearly impossible. This directory built that filter specifically for you.
          </p>
          <Link
            href="/listings?va=true"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-navy hover:bg-navy-50 transition-colors"
          >
            <Shield className="h-4 w-4" aria-hidden="true" />
            Find VA Community Care Specialists
          </Link>
        </div>
      </section>

      {/* For providers CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-100 px-4 py-1.5 text-sm text-teal-700 mb-6">
            <Users className="h-4 w-4" aria-hidden="true" /> For Pain Management Practices
          </div>
          <h2 className="text-3xl font-bold text-slate mb-4 tracking-tight">
            One new patient pays for your listing in the first visit.
          </h2>
          <p className="text-gray-400 text-base mb-8 leading-relaxed">
            Pain management patients are high-intent searchers. At $500–2,500 per treatment cycle, a Verified listing at $149/yr generates 10:1 ROI from a single referral.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/submit" className="btn-primary px-8 py-4 text-base">
              List Your Practice Free
            </Link>
            <Link href="/submit#pricing" className="btn-secondary px-8 py-4 text-base">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="py-10 px-4 bg-offwhite border-t border-gray-100">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
            <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-teal-300" aria-hidden="true" /> Free to search, always</span>
            <span className="flex items-center gap-2"><Award className="h-4 w-4 text-amber" aria-hidden="true" /> No device company bias</span>
            <span className="flex items-center gap-2"><Star className="h-4 w-4 text-amber" aria-hidden="true" /> ABPM board certification flagged</span>
            <span className="flex items-center gap-2"><Shield className="h-4 w-4 text-navy" aria-hidden="true" /> VA Community Care filter</span>
          </div>
        </div>
      </section>
    </div>
  )
}
