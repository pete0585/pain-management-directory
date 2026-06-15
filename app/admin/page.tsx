import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/server'
import AdminTable from '@/components/AdminTable'
import type { PMListing } from '@/lib/types'

export const metadata: Metadata = { title: 'Admin — PainManagementFinder' }

export default async function AdminPage() {
  const supabase = await createServiceClient()

  const [{ data: pending }, { data: approved }, { count: total }] = await Promise.all([
    supabase
      .from('pm_listings')
      .select('*')
      .eq('is_approved', false)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('pm_listings')
      .select('*')
      .eq('is_approved', true)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('pm_listings')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true),
  ])

  const { count: claimedCount } = await supabase
    .from('pm_listings')
    .select('*', { count: 'exact', head: true })
    .eq('claimed', true)

  const { count: paidCount } = await supabase
    .from('pm_listings')
    .select('*', { count: 'exact', head: true })
    .in('listing_tier', ['verified', 'featured'])

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate mb-6">PainManagementFinder Admin</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Listings', value: total ?? 0 },
          { label: 'Pending Review', value: pending?.length ?? 0 },
          { label: 'Claimed', value: claimedCount ?? 0 },
          { label: 'Paid Listings', value: paidCount ?? 0 },
        ].map((stat) => (
          <div key={stat.label} className="card p-4 text-center">
            <p className="text-2xl font-bold text-navy">{stat.value.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Pending */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-slate mb-3">
          Pending Review ({pending?.length ?? 0})
        </h2>
        <AdminTable listings={(pending ?? []) as PMListing[]} filter="pending" />
      </div>

      {/* Approved */}
      <div>
        <h2 className="text-lg font-semibold text-slate mb-3">
          Recent Approved ({approved?.length ?? 0})
        </h2>
        <AdminTable listings={(approved ?? []) as PMListing[]} filter="approved" />
      </div>
    </div>
  )
}
