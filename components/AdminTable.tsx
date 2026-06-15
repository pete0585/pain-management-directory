'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import type { PMListing } from '@/lib/types'
import { doctorName } from '@/lib/utils'

interface Props {
  listings: PMListing[]
  filter: 'pending' | 'approved'
}

export default function AdminTable({ listings, filter }: Props) {
  const [items, setItems] = useState(listings)

  async function approve(id: string) {
    await fetch(`/api/admin/approve`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setItems((prev) => prev.filter((l) => l.id !== id))
  }

  async function reject(id: string) {
    await fetch(`/api/admin/reject`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setItems((prev) => prev.filter((l) => l.id !== id))
  }

  if (items.length === 0) {
    return <p className="text-sm text-gray-400 py-8 text-center">No {filter} listings.</p>
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left">
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Specialty</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Tier</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 bg-white">
          {items.map((listing) => (
            <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <div className="font-medium text-slate">{doctorName(listing)}</div>
                {listing.npi_number && <div className="text-xs text-gray-400">NPI: {listing.npi_number}</div>}
              </td>
              <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{listing.specialty_label ?? '—'}</td>
              <td className="px-4 py-3 text-gray-500">{listing.city}, {listing.state}</td>
              <td className="px-4 py-3 hidden md:table-cell">
                <span className={`badge ${listing.listing_tier === 'featured' ? 'badge-featured' : listing.listing_tier === 'verified' ? 'badge-verified' : 'badge-free'}`}>
                  {listing.listing_tier}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {filter === 'pending' && (
                    <>
                      <button
                        onClick={() => approve(listing.id)}
                        className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium"
                      >
                        <CheckCircle className="h-4 w-4" aria-hidden="true" /> Approve
                      </button>
                      <button
                        onClick={() => reject(listing.id)}
                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium"
                      >
                        <XCircle className="h-4 w-4" aria-hidden="true" /> Reject
                      </button>
                    </>
                  )}
                  <a
                    href={`/doctor/${listing.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-navy"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
