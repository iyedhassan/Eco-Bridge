import Image from 'next/image'
import Link from 'next/link'
import { getListingById } from '@/lib/backend'
import { calculateListingImpact } from '@/lib/impact'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { getDictionary, normalizeLanguage, LANGUAGE_COOKIE_KEY } from '@/lib/i18n'
import { ListingActions } from '@/components/listing-actions'

export default async function ListingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies()
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE_KEY)?.value)
  const dictionary = getDictionary(language)
  const { id } = await params
  const listing = await getListingById(id)

  if (!listing) {
    notFound()
  }

  const impact = listing.impactEstimate ?? calculateListingImpact(listing)

  return (
    <section className="space-y-5 pb-10">
      <article className="eco-card overflow-hidden">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
          <div className="relative min-h-64 overflow-hidden rounded-2xl bg-eco-100">
            <Image src={listing.photos[0]} alt={listing.title} fill className="object-cover" />
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className="eco-badge">{listing.categoryId}</span>
              {listing.aiAnalysis ? <span className="rounded-full bg-eco-600 px-3 py-1 text-xs font-extrabold text-white">Analyse IA</span> : null}
            </div>
            <h1 className="eco-title text-3xl">{listing.title}</h1>
            <p className="text-sm font-medium text-eco-700">{listing.description}</p>

            <div className="grid gap-2 sm:grid-cols-2">
              <p className="rounded-xl bg-eco-50 px-3 py-2 text-sm font-semibold text-eco-800">{dictionary.listing.quantity}: {listing.quantity} {listing.unit}</p>
              <p className="rounded-xl bg-eco-50 px-3 py-2 text-sm font-semibold text-eco-800">{dictionary.listing.price}: {listing.pricePerUnit} TND/{listing.unit}</p>
              <p className="rounded-xl bg-eco-50 px-3 py-2 text-sm font-semibold text-eco-800">{dictionary.listing.industry}: {listing.industry}</p>
              <p className="rounded-xl bg-eco-50 px-3 py-2 text-sm font-semibold text-eco-800">{dictionary.listing.location}: {listing.location}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="eco-button-secondary">{dictionary.listing.availability}: {listing.availability}</span>
              <span className="eco-button-secondary">{dictionary.listing.urgency}: {listing.urgency}</span>
            </div>

            <div className="pt-3 space-y-3">
              <ListingActions
                listingId={listing.id}
                suggestedMessage={`Bonjour, nous sommes intéressés par votre lot de ${listing.materialType} disponible à ${listing.location}. Pouvez-vous confirmer la quantité, l’état de la matière, le prix final et les conditions de récupération ?`}
              />
              <Link href="/marketplace" className="eco-button-secondary">
                {dictionary.listing.backToMarketplace}
              </Link>
            </div>
          </div>
        </div>
      </article>

      <article className="eco-card">
        <h2 className="font-display text-2xl font-extrabold text-eco-900">Impact environnemental estimé</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <p className="rounded-xl bg-eco-50 px-3 py-3 text-sm font-bold text-eco-800">Déchets réutilisés<span className="block text-2xl text-eco-900">{impact.wasteReusedKg} kg</span></p>
          <p className="rounded-xl bg-eco-50 px-3 py-3 text-sm font-bold text-eco-800">CO₂ évité<span className="block text-2xl text-eco-900">{impact.co2ReductionKg} kg</span></p>
          <p className="rounded-xl bg-eco-50 px-3 py-3 text-sm font-bold text-eco-800">Économie estimée<span className="block text-2xl text-eco-900">{impact.moneySavedTnd} TND</span></p>
          <p className="rounded-xl bg-eco-50 px-3 py-3 text-sm font-bold text-eco-800">Stockage évité<span className="block text-2xl text-eco-900">{impact.storageAvoidedKg} kg</span></p>
        </div>
      </article>

      {listing.aiAnalysis ? (
        <article className="eco-card">
          <h2 className="font-display text-2xl font-extrabold text-eco-900">Analyse IA de la matière</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <section className="rounded-2xl bg-eco-50 p-4">
              <p className="text-sm font-extrabold text-eco-900">Valorisation</p>
              <p className="mt-2 text-sm font-semibold text-eco-700">Score: {listing.aiAnalysis.valorizationScore || listing.aiAnalysis.confidenceScore}/100</p>
              <p className="mt-1 text-sm font-semibold text-eco-700">Qualité: {listing.aiAnalysis.qualityLevel || listing.aiAnalysis.valorizationLevel}</p>
              <p className="mt-1 text-sm font-semibold text-eco-700">Risque: {listing.aiAnalysis.riskLevel || listing.aiAnalysis.qualityRisk}</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-eco-700">{listing.aiAnalysis.recommendationText || listing.aiAnalysis.recommendation}</p>
            </section>
            <section className="rounded-2xl bg-eco-50 p-4">
              <p className="text-sm font-extrabold text-eco-900">Usages possibles</p>
              <ul className="mt-2 space-y-1 text-sm font-semibold text-eco-700">
                {listing.aiAnalysis.possibleUses.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </section>
            <section className="rounded-2xl bg-eco-50 p-4">
              <p className="text-sm font-extrabold text-eco-900">Secteurs intéressés</p>
              <ul className="mt-2 space-y-1 text-sm font-semibold text-eco-700">
                {listing.aiAnalysis.interestedSectors.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </section>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <p className="rounded-xl bg-white px-3 py-3 text-sm font-bold text-eco-800 ring-1 ring-eco-200">Matière détectée<span className="block text-base text-eco-900">{listing.aiAnalysis.detectedMaterial || listing.aiAnalysis.materialType}</span></p>
            <p className="rounded-xl bg-white px-3 py-3 text-sm font-bold text-eco-800 ring-1 ring-eco-200">Prix recommandé<span className="block text-base text-eco-900">{listing.aiAnalysis.estimatedPriceRange}</span></p>
            <p className="rounded-xl bg-white px-3 py-3 text-sm font-bold text-eco-800 ring-1 ring-eco-200">CO₂ IA<span className="block text-base text-eco-900">{Math.round(listing.aiAnalysis.co2SavedKg || impact.co2ReductionKg)} kg</span></p>
          </div>
        </article>
      ) : null}
    </section>
  )
}
