import type { Metadata } from "next"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Best Pain Management Doctor in Phoenix, AZ | Pain Management Doctor Directory",
  description: "Find pain management doctor in Phoenix, Arizona. 32+ listed. Filter by city and compare providers.",
}

async function getListings() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("pain_management_listings")
    .select("*")
    .eq("city", "Phoenix")
    .eq("state", "AZ")
    .eq("is_active", true)
    .limit(24)
  return data ?? []
}

function listingName(row: Record<string, unknown>) {
  return (
    (row["business_name"] as string) ||
    (row.name as string) ||
    (row.full_name as string) ||
    (row.clinic_name as string) ||
    "Listing"
  )
}

function listingHref(row: Record<string, unknown>) {
  const slug = String(row.slug || "")
  return "/listings/SLUG".replace("SLUG", slug)
}

export default async function CityPage() {
  const listings = await getListings()
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How many pain management doctor are in Phoenix, AZ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Pain Management Doctor Directory lists 32+ pain management doctor in Phoenix, Arizona. Counts change as new listings are seeded.",
        },
      },
      {
        "@type": "Question",
        name: "How do I find pain management doctor in Phoenix?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Search findpainmanagement.com and filter by Phoenix. Compare listed providers, then contact the one that fits.",
        },
      },
    ],
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-sm text-neutral-500">Phoenix, AZ</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Pain Management Doctor in Phoenix, AZ
        </h1>
        <p className="mt-3 max-w-2xl text-neutral-600">
          32+ listed pain management doctor in the Phoenix area. Pages are generated from live directory listings — not outreach.
        </p>
        <p className="mt-2 text-sm text-neutral-500">{listings.length} shown on this page.</p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {listings.map((row: Record<string, unknown>, i: number) => (
            <li key={String(row.id || row.slug || i)} className="rounded-xl border border-neutral-200 p-4">
              <Link href={listingHref(row)} className="font-semibold hover:underline">
                {listingName(row)}
              </Link>
              <p className="mt-1 text-sm text-neutral-500">
                {String(row.city || "Phoenix")}, {String(row.state || "AZ")}
              </p>
            </li>
          ))}
        </ul>
        {listings.length === 0 && (
          <p className="mt-8 text-neutral-500">Listings for this city are still being seeded.</p>
        )}
      </main>
    </>
  )
}
