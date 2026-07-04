'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { EcoRequest } from '@/lib/types'

export default function RequestsPage() {
  const [requests, setRequests] = useState<EcoRequest[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const response = await fetch('/api/requests')
    const data = await response.json()
    if (!response.ok || !data.ok) setError(data.error || 'Connexion requise')
    else setRequests(data.data)
    setLoading(false)
  }

  async function updateStatus(id: string, status: EcoRequest['status']) {
    await fetch('/api/requests', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    await load()
  }

  useEffect(() => { void load() }, [])

  return (
    <section className="space-y-4 pb-10">
      <article className="eco-card">
        <h1 className="eco-title">Demandes / offres</h1>
        <p className="eco-subtitle">Suivi backend des demandes envoyées et reçues entre acheteurs et vendeurs.</p>
      </article>

      {error ? <article className="eco-card text-sm font-bold text-red-700">{error}</article> : null}
      {loading ? <article className="eco-card text-sm font-semibold text-eco-700">Chargement...</article> : null}

      <div className="space-y-3">
        {requests.map((request) => (
          <article key={request.id} className="eco-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="eco-badge">{request.status}</p>
                <h2 className="mt-2 font-display text-xl font-extrabold text-eco-900">{request.listing?.title || 'Annonce'}</h2>
                <p className="mt-1 text-sm font-semibold text-eco-700">{request.message}</p>
                <p className="mt-2 text-xs font-bold text-eco-600">Quantité: {request.quantityKg || '-'} kg · Prix proposé: {request.proposedPrice || '-'} TND</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="eco-button-secondary" type="button" onClick={() => void updateStatus(request.id, 'NEGOTIATION')}>Négocier</button>
                <button className="eco-button-secondary" type="button" onClick={() => void updateStatus(request.id, 'REFUSED')}>Refuser</button>
                <button className="eco-button" type="button" onClick={() => void updateStatus(request.id, 'ACCEPTED')}>Accepter</button>
                <button className="eco-button" type="button" onClick={() => void updateStatus(request.id, 'COMPLETED')}>Finaliser</button>
              </div>
            </div>
            {request.listingId ? <Link href={`/listings/${request.listingId}`} className="mt-3 inline-flex text-sm font-bold text-eco-700 underline">Voir l’annonce</Link> : null}
          </article>
        ))}
      </div>

      {!loading && requests.length === 0 && !error ? <article className="eco-card text-sm font-bold text-eco-700">Aucune demande pour le moment.</article> : null}
    </section>
  )
}
