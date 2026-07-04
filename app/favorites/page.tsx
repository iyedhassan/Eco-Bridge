'use client'

import { useEffect, useState } from 'react'
import { Listing } from '@/lib/types'
import { ListingCard } from '@/components/listing-card'

export default function FavoritesPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const response = await fetch('/api/favorites')
      const data = await response.json()
      if (!response.ok || !data.ok) setError(data.error || 'Connexion requise')
      else setListings(data.data)
    }
    void load()
  }, [])

  return (
    <section className="space-y-4 pb-10">
      <article className="eco-card">
        <h1 className="eco-title">Favoris & opportunités</h1>
        <p className="eco-subtitle">Annonces sauvegardées pour comparaison et recommandations IA personnalisées.</p>
      </article>
      {error ? <article className="eco-card text-sm font-bold text-red-700">{error}</article> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
      </div>
      {!error && listings.length === 0 ? <article className="eco-card text-sm font-bold text-eco-700">Aucun favori pour le moment.</article> : null}
    </section>
  )
}
