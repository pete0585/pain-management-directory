import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getListingBySlug, getAllSlugs } from '@/lib/data'
import ListingDetail from '@/components/ListingDetail'
import { doctorName } from '@/lib/utils'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const listing = await getListingBySlug(slug).catch(() => null)

  if (!listing) return { title: 'Specialist Not Found' }

  const name = doctorName(listing)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.findpainmanagement.com'

  return {
    title: `${name}, Pain Management Specialist in ${listing.city}, ${listing.state}`,
    description: listing.bio
      ? listing.bio.slice(0, 160)
      : `${name} is a ${listing.specialty_label ?? 'pain management specialist'} in ${listing.city}, ${listing.state}. Find contact information, specialties, and procedures offered.`,
    alternates: { canonical: `/listings/${slug}` },
    openGraph: {
      title: `${name} — Pain Management Specialist in ${listing.city}, ${listing.state}`,
      images: listing.photo_url ? [listing.photo_url] : [],
      url: `${siteUrl}/listings/${listing.slug}`,
    },
  }
}

export async function generateStaticParams() {
  const slugs = await getAllSlugs().catch(() => [])
  return slugs.slice(0, 1000).map((slug) => ({ slug }))
}

export default async function ListingPage({ params }: PageProps) {
  const { slug } = await params
  const listing = await getListingBySlug(slug)

  if (!listing) notFound()

  return <ListingDetail listing={listing} />
}
