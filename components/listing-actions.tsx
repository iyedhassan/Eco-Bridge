'use client'

import { useState } from 'react'
import { Heart, Loader2, Send, Sparkles } from 'lucide-react'

export function ListingActions({ listingId, suggestedMessage }: { listingId: string; suggestedMessage?: string }) {
  const [message, setMessage] = useState(suggestedMessage || 'Bonjour, je suis intéressé par cette matière. Pouvez-vous confirmer la disponibilité et les conditions de récupération ?')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  async function addFavorite() {
    setStatus('')
    const response = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId }),
    })
    const data = await response.json().catch(() => null)
    setStatus(response.ok && data?.ok ? 'Favori mis à jour.' : data?.error || 'Connecte-toi pour ajouter un favori.')
  }

  async function analyzeWithAi() {
    setStatus('')
    setAnalyzing(true)
    const response = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId }),
    })
    const data = await response.json().catch(() => null)
    if (response.ok && (data?.ok || data?.success)) {
      setStatus(data.data?.source === 'gemini' ? 'Analyse Gemini sauvegardée.' : 'Analyse fallback IA sauvegardée.')
      window.location.reload()
    } else {
      setStatus(data?.error || 'Impossible de lancer l’analyse IA sur cette annonce.')
    }
    setAnalyzing(false)
  }

  async function sendRequest() {
    setLoading(true)
    setStatus('')
    const response = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, message }),
    })
    const data = await response.json().catch(() => null)
    setStatus(response.ok && data?.ok ? 'Demande envoyée au vendeur.' : data?.error || 'Impossible d’envoyer la demande.')
    setLoading(false)
  }

  return (
    <section className="rounded-2xl border border-eco-200 bg-eco-50 p-4">
      <p className="text-sm font-extrabold text-eco-900">Interaction backend + IA</p>
      <p className="mt-1 text-xs font-semibold text-eco-700">Analyse l’annonce avec Gemini/fallback, ajoute aux favoris ou envoie une vraie demande enregistrée en base.</p>
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        className="mt-3 min-h-24 w-full rounded-xl border border-eco-200 px-3 py-2 text-sm font-semibold text-eco-900"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={analyzeWithAi} disabled={analyzing} className="eco-button-secondary">
          {analyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          {analyzing ? 'Analyse...' : 'Analyser avec IA'}
        </button>
        <button type="button" onClick={addFavorite} className="eco-button-secondary">
          <Heart className="mr-2 h-4 w-4" /> Ajouter aux favoris
        </button>
        <button type="button" onClick={sendRequest} disabled={loading} className="eco-button">
          <Send className="mr-2 h-4 w-4" /> {loading ? 'Envoi...' : 'Envoyer une demande'}
        </button>
      </div>
      {status ? <p className="mt-3 rounded-xl bg-white px-3 py-2 text-sm font-bold text-eco-800">{status}</p> : null}
    </section>
  )
}
