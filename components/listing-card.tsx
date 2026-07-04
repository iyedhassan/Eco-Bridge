'use client'

import Link from 'next/link'
import { MapPin, Package, Coins, Clock3, Leaf, Sparkles } from 'lucide-react'
import { calculateListingImpact } from '@/lib/impact'
import { Listing } from '@/lib/types'
import { useLanguage } from '@/components/language-provider'

export function ListingCard({ listing }: { listing: Listing }) {
  const { dictionary } = useLanguage()
  const impact = listing.impactEstimate ?? calculateListingImpact(listing)

  return (
    <article className="eco-card transition hover:-translate-y-0.5 hover:shadow-[0_18px_32px_rgba(16,66,44,0.14)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap gap-2">
            <p className="eco-badge">{listing.categoryId}</p>
            {listing.aiAnalysis ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-eco-600 px-3 py-1 text-xs font-extrabold text-white">
                <Sparkles className="h-3.5 w-3.5" /> IA analysé
              </span>
            ) : null}
          </div>
          <h3 className="mt-2 font-display text-xl font-extrabold text-eco-900">{listing.title}</h3>
          <p className="mt-1 text-sm font-medium text-eco-700">{listing.description}</p>
        </div>
        <span className="rounded-full bg-eco-50 px-3 py-1 text-xs font-bold text-eco-700">{dictionary.listing.availability}: {listing.availability}</span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-eco-800">
          <Package className="h-4 w-4" />
          {listing.quantity} {listing.unit}
        </p>
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-eco-800">
          <Coins className="h-4 w-4" />
          {listing.pricePerUnit} TND/{listing.unit}
        </p>
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-eco-800">
          <MapPin className="h-4 w-4" />
          {listing.location}
        </p>
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-eco-800">
          <Clock3 className="h-4 w-4" />
          {dictionary.listing.urgency}: {listing.urgency}
        </p>
      </div>

      <div className="mt-4 grid gap-2 rounded-2xl bg-eco-50 p-3 sm:grid-cols-3">
        <p className="text-xs font-bold text-eco-700"><Leaf className="mr-1 inline h-3.5 w-3.5" />CO₂ évité<br /><span className="text-base text-eco-900">{Math.round(listing.aiAnalysis?.co2SavedKg || impact.co2ReductionKg)} kg</span></p>
        <p className="text-xs font-bold text-eco-700">Score IA<br /><span className="text-base text-eco-900">{listing.aiAnalysis ? `${listing.aiAnalysis.valorizationScore || listing.aiAnalysis.confidenceScore}/100` : 'À analyser'}</span></p>
        <p className="text-xs font-bold text-eco-700">Risque<br /><span className="text-base text-eco-900">{listing.aiAnalysis?.riskLevel || 'À vérifier'}</span></p>
      </div>

      {listing.aiAnalysis ? (
        <div className="mt-3 rounded-2xl border border-eco-200 bg-white p-3 text-xs font-bold text-eco-700">
          Prix IA recommandé: <span className="text-eco-900">{listing.aiAnalysis.estimatedPriceRange}</span>
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-bold text-eco-700">{dictionary.listing.material}: {listing.materialType}</span>
        <Link href={`/listings/${listing.id}`} className="eco-button-secondary">
          {dictionary.listing.viewDetails}
        </Link>
      </div>
    </article>
  )
}
