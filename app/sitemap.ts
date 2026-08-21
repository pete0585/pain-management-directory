import { MetadataRoute } from 'next'
import { getAllSlugs, getTopCities } from '@/lib/data'
import { CONDITIONS, PROCEDURES, SPECIALTIES } from '@/lib/types'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.painmanagementfinder.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, topCities] = await Promise.all([
    getAllSlugs().catch(() => [] as string[]),
    getTopCities(50).catch(() => [] as Array<{ city: string; state: string; count: number }>),
  ])

  const doctorUrls: MetadataRoute.Sitemap = slugs.slice(0, 5000).map((slug) => ({
    url: `${siteUrl}/listings/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const cityUrls: MetadataRoute.Sitemap = topCities.map(({ city, state }) => ({
    url: `${siteUrl}/pain-management-doctors/${city.toLowerCase().replace(/\s+/g, '-')}-${state.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }))

  const conditionUrls: MetadataRoute.Sitemap = CONDITIONS.map((c) => ({
    url: `${siteUrl}/chronic-pain-conditions/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const procedureUrls: MetadataRoute.Sitemap = PROCEDURES.map((p) => ({
    url: `${siteUrl}/pain-treatments/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${siteUrl}/listings`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/submit`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/chronic-pain-conditions`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/pain-treatments`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    ...cityUrls,
    ...conditionUrls,
    ...procedureUrls,
    ...doctorUrls,
  ]
}
