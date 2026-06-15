import Link from 'next/link'
import { MapPin, Phone, Star, Shield, Award, CheckCircle } from 'lucide-react'
import type { PMListing } from '@/lib/types'
import { doctorName, formatPhone } from '@/lib/utils'

interface Props {
  listing: PMListing
  featured?: boolean
}

export default function ListingCard({ listing, featured }: Props) {
  const name = doctorName(listing)

  return (
    <Link href={`/doctor/${listing.slug}`} className="card p-5 flex flex-col gap-3 group">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-navy-50 flex items-center justify-center overflow-hidden">
          {listing.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={listing.photo_url} alt={name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-xl font-bold text-navy">
              {(listing.last_name ?? listing.business_name ?? 'P')[0]?.toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-slate truncate group-hover:text-navy transition-colors leading-tight">
            {name}
          </h3>
          {listing.specialty_label && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">{listing.specialty_label}</p>
          )}
          {listing.business_name && listing.first_name && (
            <p className="text-xs text-gray-400 truncate">{listing.business_name}</p>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        {listing.listing_tier === 'featured' && (
          <span className="badge-featured">
            <Star className="h-3 w-3" aria-hidden="true" /> Featured
          </span>
        )}
        {listing.listing_tier === 'verified' && (
          <span className="badge-verified">
            <CheckCircle className="h-3 w-3" aria-hidden="true" /> Verified
          </span>
        )}
        {listing.board_certified_abpm && (
          <span className="badge bg-amber/10 text-amber-700">
            <Award className="h-3 w-3" aria-hidden="true" /> ABPM Certified
          </span>
        )}
        {listing.va_community_care && (
          <span className="badge-va">
            <Shield className="h-3 w-3" aria-hidden="true" /> VA Community Care
          </span>
        )}
      </div>

      {/* Location */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-teal" aria-hidden="true" />
        <span className="truncate">{listing.city}, {listing.state}</span>
        {listing.practice_address && (
          <span className="truncate text-gray-300 hidden sm:inline"> — {listing.practice_address}</span>
        )}
      </div>

      {/* Procedures preview */}
      {listing.procedures_offered.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {listing.procedures_offered.slice(0, 3).map((p) => (
            <span key={p} className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">
              {p}
            </span>
          ))}
          {listing.procedures_offered.length > 3 && (
            <span className="text-xs text-gray-400">+{listing.procedures_offered.length - 3} more</span>
          )}
        </div>
      )}

      {/* CTA row */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
        {listing.phone && (
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
            {formatPhone(listing.phone)}
          </span>
        )}
        {listing.accepting_new_patients && (
          <span className="text-xs text-teal font-medium ml-auto">Accepting patients</span>
        )}
      </div>
    </Link>
  )
}
