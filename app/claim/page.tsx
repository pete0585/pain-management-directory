import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Claim Your Pain Management Clinic Listing',
  description: 'Find your listing and claim it to verify ownership and unlock your full profile.',
}

export default function ClaimIndexPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20">
      <h1 className="text-2xl font-bold text-gray-900 mb-3">Claim Your Pain Management Clinic Listing</h1>
      <p className="text-gray-500 mb-8">
        Search for your name or practice below. Once you find your listing, click{" "}
        <strong>Claim This Listing</strong> to verify ownership and unlock your full profile.
      </p>
      <form action="/listings" method="GET" className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          name="q"
          placeholder="Your your name or clinic name..."
          required
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          Find My Listing
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-400">
        Already have a claim link?{" "}
        <a href="/listings" className="text-blue-600 hover:underline">
          Browse all listings
        </a>
      </p>
    </div>
  )
}
