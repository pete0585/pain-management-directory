import Link from 'next/link'
import { MapPin, Phone, Globe, Star, Shield, Award, CheckCircle, Calendar, ArrowRight } from 'lucide-react'
import type { PMListing } from '@/lib/types'
import { doctorName, formatPhone } from '@/lib/utils'

interface Props {
  listing: PMListing
}

export default function ListingDetail({ listing }: Props) {
  const name = doctorName(listing)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.painmanagementfinder.com'

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 mb-6 flex flex-wrap gap-1">
        <Link href="/" className="hover:text-navy">Home</Link>
        <span>/</span>
        <Link href="/listings" className="hover:text-navy">Specialists</Link>
        <span>/</span>
        <Link href={`/listings?state=${listing.state}`} className="hover:text-navy">{listing.state}</Link>
        <span>/</span>
        <Link href={`/pain-management-doctors/${listing.city.toLowerCase().replace(/\s+/g, '-')}-${listing.state.toLowerCase()}`} className="hover:text-navy">{listing.city}</Link>
        <span>/</span>
        <span className="text-slate">{name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Header card */}
          <div className="card p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 h-20 w-20 rounded-2xl bg-navy-50 flex items-center justify-center overflow-hidden">
                {listing.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={listing.photo_url} alt={name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-navy">
                    {(listing.last_name ?? listing.business_name ?? 'P')[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-slate">{name}</h1>
                {listing.specialty_label && (
                  <p className="text-gray-500 mt-1">{listing.specialty_label}</p>
                )}
                {listing.business_name && listing.first_name && (
                  <p className="text-sm text-gray-400 mt-0.5">{listing.business_name}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-3">
                  {listing.listing_tier === 'featured' && (
                    <span className="badge-featured"><Star className="h-3 w-3" aria-hidden="true" /> Featured</span>
                  )}
                  {listing.listing_tier === 'verified' && (
                    <span className="badge-verified"><CheckCircle className="h-3 w-3" aria-hidden="true" /> Verified</span>
                  )}
                  {listing.board_certified_abpm && (
                    <span className="badge bg-amber/10 text-amber-700"><Award className="h-3 w-3" aria-hidden="true" /> ABPM Board Certified</span>
                  )}
                  {listing.va_community_care && (
                    <span className="badge-va"><Shield className="h-3 w-3" aria-hidden="true" /> VA Community Care</span>
                  )}
                  {listing.accepting_new_patients && (
                    <span className="badge bg-green-50 text-green-700"><CheckCircle className="h-3 w-3" aria-hidden="true" /> Accepting New Patients</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          {listing.bio && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-slate mb-3">About</h2>
              <p className="text-gray-600 leading-relaxed">{listing.bio}</p>
            </div>
          )}

          {/* Procedures */}
          {listing.procedures_offered.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-slate mb-4">Treatments & Procedures</h2>
              <div className="flex flex-wrap gap-2">
                {listing.procedures_offered.map((p) => (
                  <span key={p} className="rounded-xl bg-teal-50 text-teal-700 px-3 py-1.5 text-sm font-medium">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Conditions */}
          {listing.conditions_treated.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-slate mb-4">Conditions Treated</h2>
              <div className="flex flex-wrap gap-2">
                {listing.conditions_treated.map((c) => (
                  <span key={c} className="rounded-xl bg-navy-50 text-navy-600 px-3 py-1.5 text-sm font-medium">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Insurance */}
          {listing.insurance_accepted.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-slate mb-4">Insurance Accepted</h2>
              <div className="flex flex-wrap gap-2">
                {listing.insurance_accepted.map((ins) => (
                  <span key={ins} className="rounded-xl bg-gray-50 text-gray-600 px-3 py-1.5 text-sm">
                    {ins}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Claim CTA */}
          {!listing.claimed && listing.listing_tier === 'free' && (
            <div className="rounded-2xl border-2 border-dashed border-navy/20 p-6 text-center">
              <p className="text-sm font-semibold text-slate mb-1">Is this your practice?</p>
              <p className="text-xs text-gray-400 mb-4">Claim this listing to add your photo, bio, procedures, and get priority placement.</p>
              <Link href={`/claim/${listing.id}`} className="btn-primary text-sm px-6 py-2.5">
                Claim This Listing
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Contact card */}
          <div className="card p-5 flex flex-col gap-3">
            <h2 className="text-base font-semibold text-slate">Contact</h2>

            {listing.practice_address && (
              <div className="flex items-start gap-2.5 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-teal mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span>{listing.practice_address}<br />{listing.city}, {listing.state} {listing.zip}</span>
              </div>
            )}
            {!listing.practice_address && (
              <div className="flex items-center gap-2.5 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-teal flex-shrink-0" aria-hidden="true" />
                <span>{listing.city}, {listing.state}</span>
              </div>
            )}

            {listing.phone && (
              <a href={`tel:${listing.phone}`} className="flex items-center gap-2.5 text-sm text-navy font-medium hover:text-teal transition-colors">
                <Phone className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                {formatPhone(listing.phone)}
              </a>
            )}

            {listing.website_url && (
              <a
                href={listing.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-teal font-medium hover:text-teal-600 transition-colors"
              >
                <Globe className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                Visit Website
              </a>
            )}

            {listing.npi_number && (
              <div className="text-xs text-gray-400 pt-2 border-t border-gray-50">
                NPI: {listing.npi_number}
              </div>
            )}
          </div>

          {/* Upgrade CTA for verified listings */}
          {listing.listing_tier !== 'featured' && listing.claimed && (
            <div className="card p-5 bg-gradient-to-br from-navy-50 to-teal-50">
              <p className="text-sm font-semibold text-slate mb-1">Upgrade to Featured</p>
              <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                Get top placement, highlighted badge, and VA Community Care filter visibility.
              </p>
              <button
                onClick={() => {
                  fetch('/api/upgrade', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ listingId: listing.id, tier: 'featured' }),
                  })
                    .then(r => r.json())
                    .then(d => { if (d.url) window.location.href = d.url })
                }}
                className="btn-primary text-xs px-4 py-2 w-full"
              >
                Upgrade — $299/yr
              </button>
            </div>
          )}

          {/* Nearby search */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate mb-3">Nearby Specialists</h3>
            <Link
              href={`/pain-management-doctors/${listing.city.toLowerCase().replace(/\s+/g, '-')}-${listing.state.toLowerCase()}`}
              className="flex items-center gap-2 text-sm text-teal hover:text-teal-600 font-medium"
            >
              Pain management in {listing.city}, {listing.state}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href={`/listings?state=${listing.state}`}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-navy font-medium mt-2"
            >
              All specialists in {listing.state}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': listing.business_name && !listing.first_name ? 'MedicalClinic' : 'Physician',
            name,
            description: listing.bio ?? `${name} is a pain management specialist in ${listing.city}, ${listing.state}.`,
            address: {
              '@type': 'PostalAddress',
              streetAddress: listing.practice_address ?? undefined,
              addressLocality: listing.city,
              addressRegion: listing.state,
              postalCode: listing.zip ?? undefined,
              addressCountry: 'US',
            },
            telephone: listing.phone ?? undefined,
            url: listing.website_url ?? `${siteUrl}/doctor/${listing.slug}`,
            ...(listing.npi_number ? { identifier: { '@type': 'PropertyValue', name: 'NPI', value: listing.npi_number } } : {}),
          }),
        }}
      />
    </div>
  )
}
