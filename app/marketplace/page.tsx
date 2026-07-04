'use client'

import { useEffect, useMemo, useState } from 'react'
import { Listing } from '@/lib/types'
import { ListingCard } from '@/components/listing-card'
import { EmptyState } from '@/components/empty-state'
import { useLanguage } from '@/components/language-provider'

export default function MarketplacePage() {
  const { dictionary } = useLanguage()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState({ materialType: '', location: '', industry: '' })

  async function loadListings() {
    setLoading(true)
    const params = new URLSearchParams()
    if (query.materialType) params.set('materialType', query.materialType)
    if (query.location) params.set('location', query.location)
    if (query.industry) params.set('industry', query.industry)

    const response = await fetch(`/api/listings?${params.toString()}`)
    const data = await response.json()
    setListings(data.data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    void loadListings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const hasFilters = useMemo(
    () => Boolean(query.materialType || query.location || query.industry),
    [query.industry, query.location, query.materialType],
  )

  return (
    <section className="space-y-4 pb-10">
      <article className="eco-card">
        <h1 className="eco-title">{dictionary.marketplace.title}</h1>
        <p className="eco-subtitle">{dictionary.marketplace.subtitle}</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <input
            value={query.materialType}
            onChange={(event) => setQuery((current) => ({ ...current, materialType: event.target.value }))}
            placeholder={dictionary.marketplace.materialType}
            className="rounded-xl border border-eco-200 px-3 py-2 font-semibold text-eco-900"
          />
          <input
            value={query.industry}
            onChange={(event) => setQuery((current) => ({ ...current, industry: event.target.value }))}
            placeholder={dictionary.marketplace.industry}
            className="rounded-xl border border-eco-200 px-3 py-2 font-semibold text-eco-900"
          />
          <input
            value={query.location}
            onChange={(event) => setQuery((current) => ({ ...current, location: event.target.value }))}
            placeholder={dictionary.marketplace.location}
            className="rounded-xl border border-eco-200 px-3 py-2 font-semibold text-eco-900"
          />
          <button onClick={() => void loadListings()} className="eco-button" type="button">
            {dictionary.marketplace.search}
          </button>
        </div>

        {hasFilters ? (
          <button
            type="button"
            className="mt-3 text-sm font-bold text-eco-700 underline"
            onClick={() => {
              setQuery({ materialType: '', location: '', industry: '' })
              setTimeout(() => void loadListings(), 0)
            }}
          >
            {dictionary.marketplace.reset}
          </button>
        ) : null}
      </article>

      {loading ? <article className="eco-card text-sm font-semibold text-eco-700">{dictionary.marketplace.loading}</article> : null}

      {!loading && listings.length === 0 ? (
        <EmptyState
          title={dictionary.marketplace.emptyTitle}
          subtitle={dictionary.marketplace.emptySubtitle}
        />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  )
}
