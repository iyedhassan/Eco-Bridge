'use client'

import dynamic from 'next/dynamic'
import { FormEvent, useEffect, useState } from 'react'
import { ClipboardCheck, Factory, Leaf, Mail, MapPin, Sparkles, Target } from 'lucide-react'
import { AdvisorResult } from '@/lib/types'
import { EmptyState } from '@/components/empty-state'
import { useLanguage } from '@/components/language-provider'

const NearbyListingsMap = dynamic(
  () => import('@/components/nearby-listings-map').then((module) => module.NearbyListingsMap),
  {
    ssr: false,
    loading: () => (
      <div className="eco-map-grid animate-pulse rounded-2xl border border-eco-200 bg-white/70" aria-hidden="true" />
    ),
  },
)

export default function AdvisorPage() {
  const { dictionary, language } = useLanguage()
  const [form, setForm] = useState({ description: '' })
  const [result, setResult] = useState<AdvisorResult | null>(null)
  const [selectedListingId, setSelectedListingId] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const needPlaceholder =
    language === 'ar'
      ? 'اكتب بالتفيل شنوة تحتاج: نوع المادة، الاستعمال، الكمية، والمنطقة (مثال: نحب فواضل بلاستيك PET في صفاقس لمصنع تغليف)'
      : language === 'fr'
        ? 'Exemple: Je cherche des déchets plastiques PET à Sfax pour fabriquer des emballages recyclés.'
        : 'Example: I need PET plastic waste in Sfax to produce recycled packaging.'

  useEffect(() => {
    setSelectedListingId(result?.nearbyListings[0]?.id)
  }, [result])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json()

      if (!response.ok || !data.ok) {
        setError(data.error || dictionary.advisor.apiError)
        return
      }

      setResult(data.data)
    } catch {
      setError(dictionary.advisor.networkError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="space-y-4 pb-10">
      <article className="eco-card overflow-hidden">
        <div className="rounded-3xl bg-gradient-to-br from-eco-900 to-eco-700 p-5 text-white">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em]">
            <Sparkles className="h-4 w-4" /> EcoBridge AI Decision Engine
          </p>
          <h1 className="mt-3 font-display text-3xl font-extrabold">{dictionary.advisor.title}</h1>
          <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-white/90">
            {dictionary.advisor.subtitle} L’IA analyse le besoin, recommande les matières, classe les opportunités et calcule l’impact environnemental.
          </p>
        </div>

        <form className="mt-5 grid gap-3 sm:grid-cols-3" onSubmit={handleSubmit}>
          <textarea
            value={form.description}
            onChange={(event) => setForm({ description: event.target.value })}
            placeholder={needPlaceholder}
            className="min-h-28 rounded-2xl border border-eco-200 px-4 py-3 font-semibold text-eco-900 shadow-[0_10px_26px_rgba(14,68,46,0.08)] focus:outline-none focus:ring-2 focus:ring-eco-300 sm:col-span-3"
            required
          />

          <p className="rounded-xl border border-dashed border-eco-300 bg-eco-50/80 px-3 py-2 text-xs font-bold text-eco-700 sm:col-span-2">
            L’IA déduit automatiquement la matière, la localisation et le secteur, puis explique les meilleurs matchs pour une démonstration claire devant le jury.
          </p>

          <button className="eco-button" type="submit" disabled={loading}>
            {loading ? dictionary.advisor.analyzing : dictionary.advisor.analyze}
          </button>
        </form>

        {error ? <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p> : null}
      </article>

      {!result && !loading ? (
        <EmptyState
          title={dictionary.advisor.noAnalysisTitle}
          subtitle={dictionary.advisor.noAnalysisSubtitle}
        />
      ) : null}

      {result ? (
        <article className="eco-card space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-eco-900">{dictionary.advisor.output}</h2>
              <p className="mt-2 rounded-2xl bg-eco-50 px-4 py-3 text-sm font-semibold text-eco-800">{result.projectSummary}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-extrabold text-eco-700">
                {result.mainMaterial ? <span className="rounded-full bg-white px-3 py-1 ring-1 ring-eco-200">Matière: {result.mainMaterial}</span> : null}
                {result.detectedCity ? <span className="rounded-full bg-white px-3 py-1 ring-1 ring-eco-200">Ville: {result.detectedCity}</span> : null}
                {result.detectedGoal ? <span className="rounded-full bg-white px-3 py-1 ring-1 ring-eco-200">Objectif: {result.detectedGoal}</span> : null}
              </div>
            </div>
            <span className="rounded-full bg-eco-600 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-white">
              Analyse IA prête pour démo
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <section className="rounded-2xl bg-eco-50 p-4">
              <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-eco-600"><Target className="h-4 w-4" /> Matières recommandées</p>
              <ul className="mt-2 space-y-1 text-sm font-semibold text-eco-800">
                {result.recommendedMaterials.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </section>

            <section className="rounded-2xl bg-eco-50 p-4">
              <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-eco-600"><Leaf className="h-4 w-4" /> Idées de valorisation</p>
              <ul className="mt-2 space-y-1 text-sm font-semibold text-eco-800">
                {result.valorizationIdeas.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </section>

            <section className="rounded-2xl bg-eco-50 p-4">
              <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-eco-600"><ClipboardCheck className="h-4 w-4" /> Prochaines étapes</p>
              <ul className="mt-2 space-y-1 text-sm font-semibold text-eco-800">
                {result.nextSteps.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </section>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <section className="rounded-2xl bg-white p-4 ring-1 ring-eco-200">
              <p className="text-sm font-bold uppercase tracking-wide text-eco-600">{dictionary.advisor.byproducts}</p>
              <ul className="mt-2 space-y-1 text-sm font-semibold text-eco-800">
                {result.byproducts.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </section>

            <section className="rounded-2xl bg-white p-4 ring-1 ring-eco-200">
              <p className="text-sm font-bold uppercase tracking-wide text-eco-600">{dictionary.advisor.reuseTargets}</p>
              <ul className="mt-2 space-y-1 text-sm font-semibold text-eco-800">
                {result.reuseTargets.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </section>

            <section className="rounded-2xl bg-white p-4 ring-1 ring-eco-200">
              <p className="text-sm font-bold uppercase tracking-wide text-eco-600">{dictionary.advisor.alternatives}</p>
              <ul className="mt-2 space-y-1 text-sm font-semibold text-eco-800">
                {result.alternatives.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </section>
          </div>

          <section className="rounded-2xl border border-eco-200 bg-white p-4">
            <p className="text-sm font-bold uppercase tracking-wide text-eco-600">{dictionary.advisor.impact}</p>
            <div className="mt-2 grid gap-3 sm:grid-cols-4">
              <p className="rounded-xl bg-eco-50 px-3 py-2 text-sm font-bold text-eco-800">{dictionary.advisor.wasteReused}: {result.ecoImpactEstimate.wasteReusedKg} kg</p>
              <p className="rounded-xl bg-eco-50 px-3 py-2 text-sm font-bold text-eco-800">{dictionary.advisor.co2Reduced}: {result.ecoImpactEstimate.co2ReductionKg} kg</p>
              <p className="rounded-xl bg-eco-50 px-3 py-2 text-sm font-bold text-eco-800">{dictionary.advisor.moneySaved}: {result.ecoImpactEstimate.moneySavedTnd} TND</p>
              <p className="rounded-xl bg-eco-50 px-3 py-2 text-sm font-bold text-eco-800">Stockage évité: {result.ecoImpactEstimate.storageAvoidedKg} kg</p>
            </div>
          </section>

          <section className="rounded-2xl border border-eco-200 bg-white p-4">
            <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-eco-600"><Mail className="h-4 w-4" /> Message professionnel généré</p>
            <p className="mt-2 rounded-2xl bg-eco-50 px-4 py-3 text-sm font-semibold leading-6 text-eco-800">{result.professionalMessage || result.contactMessage}</p>
          </section>

          <section className="rounded-2xl border border-eco-200 bg-white p-4">
            <p className="text-sm font-bold uppercase tracking-wide text-eco-600">Meilleures opportunités avec score IA</p>
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              {result.matchedOpportunities.map(({ listing, score }) => (
                <article key={listing.id} className="rounded-2xl border border-eco-200 bg-eco-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-extrabold text-eco-900">{listing.title}</h3>
                    <span className="rounded-full bg-white px-2 py-1 text-xs font-extrabold text-eco-700">{score.total}/100</span>
                  </div>
                  <p className="mt-1 text-xs font-bold text-eco-700">{score.badge}</p>
                  <p className="mt-2 text-xs font-semibold leading-5 text-eco-700">{score.explanation}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-eco-200 bg-white p-4">
            <p className="text-sm font-bold uppercase tracking-wide text-eco-600">{dictionary.advisor.nearbyListings}</p>

            {result.nearbyListings.length === 0 ? (
              <p className="mt-3 rounded-xl bg-eco-50 px-3 py-3 text-sm font-semibold text-eco-700">{dictionary.marketplace.emptySubtitle}</p>
            ) : (
              <div className="mt-3 grid gap-4 lg:grid-cols-[1.25fr_1fr]">
                <div className="overflow-hidden rounded-2xl border border-eco-200 shadow-[0_18px_34px_rgba(14,68,46,0.14)]">
                  <NearbyListingsMap
                    listings={result.nearbyListings}
                    selectedListingId={selectedListingId}
                    onSelectListing={setSelectedListingId}
                    labels={{
                      industry: dictionary.listing.industry,
                      location: dictionary.listing.location,
                      quantity: dictionary.listing.quantity,
                      price: dictionary.listing.price,
                    }}
                  />
                </div>

                <div className="eco-map-list">
                  {result.nearbyListings.map((listing) => {
                    const isActive = selectedListingId === listing.id
                    return (
                      <button
                        key={listing.id}
                        type="button"
                        onClick={() => setSelectedListingId(listing.id)}
                        className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                          isActive
                            ? 'border-eco-500 bg-eco-50 shadow-[0_10px_24px_rgba(14,68,46,0.16)]'
                            : 'border-eco-200 bg-white hover:border-eco-400 hover:bg-eco-50/50'
                        }`}
                      >
                        <p className="text-sm font-extrabold text-eco-900">{listing.title}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-eco-700">
                          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1">
                            <Factory className="h-3.5 w-3.5" />
                            {dictionary.listing.industry}: {listing.industry}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {dictionary.listing.location}: {listing.location}
                          </span>
                        </div>
                        <p className="mt-2 text-xs font-semibold text-eco-700">
                          {dictionary.listing.quantity}: {listing.quantity} {listing.unit} | {dictionary.listing.price}: {listing.pricePerUnit} TND/{listing.unit}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </section>
        </article>
      ) : null}
    </section>
  )
}
