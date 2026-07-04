'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/components/language-provider'

type AdminSummary = {
  users: Array<{ id: string; name: string; role: string; email: string; industry?: string; location?: string }>
  listings: Array<{ id: string; title: string; availability: string; location: string; aiAnalysis?: { valorizationScore?: number; co2SavedKg?: number; source?: string } }>
  categories: Array<{ id: string; name: string }>
  requests: Array<{ id: string; status: string; listingId: string }>
  transactions: Array<{ id: string; amountTnd: number; commissionTnd: number; status: string }>
  notifications: Array<{ id: string; type: string }>
}

export default function AdminPage() {
  const { dictionary } = useLanguage()
  const [summary, setSummary] = useState<AdminSummary | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const response = await fetch('/api/admin/summary')
      const data = await response.json()
      if (!response.ok || !data.ok) {
        setError(data.error || dictionary.admin.accessRequired)
        return
      }
      setSummary(data.data)
    }
    void load()
  }, [dictionary.admin.accessRequired])

  const totalCommission = summary?.transactions.reduce((sum, tx) => sum + tx.commissionTnd, 0) ?? 0
  const aiAnalyses = summary?.listings.filter((listing) => listing.aiAnalysis).length ?? 0
  const averageAiScore = aiAnalyses && summary ? Math.round(summary.listings.reduce((sum, listing) => sum + (listing.aiAnalysis?.valorizationScore ?? 0), 0) / aiAnalyses) : 0
  const totalCo2Ai = summary ? Math.round(summary.listings.reduce((sum, listing) => sum + (listing.aiAnalysis?.co2SavedKg ?? 0), 0)) : 0

  return (
    <section className="space-y-4 pb-10">
      <article className="eco-card">
        <h1 className="eco-title">Administration EcoBridge</h1>
        <p className="eco-subtitle">Vue backend complète: utilisateurs, annonces, demandes, transactions, commissions et notifications.</p>
      </article>

      {error ? <article className="eco-card text-sm font-bold text-red-700">{error}</article> : null}
      {!summary && !error ? <article className="eco-card text-sm font-semibold text-eco-700">{dictionary.admin.loading}</article> : null}

      {summary ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <article className="eco-card"><p className="text-sm font-bold text-eco-600">Utilisateurs</p><p className="mt-2 font-display text-3xl font-extrabold text-eco-900">{summary.users.length}</p></article>
            <article className="eco-card"><p className="text-sm font-bold text-eco-600">Annonces</p><p className="mt-2 font-display text-3xl font-extrabold text-eco-900">{summary.listings.length}</p></article>
            <article className="eco-card"><p className="text-sm font-bold text-eco-600">Demandes</p><p className="mt-2 font-display text-3xl font-extrabold text-eco-900">{summary.requests.length}</p></article>
            <article className="eco-card"><p className="text-sm font-bold text-eco-600">Transactions</p><p className="mt-2 font-display text-3xl font-extrabold text-eco-900">{summary.transactions.length}</p></article>
            <article className="eco-card"><p className="text-sm font-bold text-eco-600">Commission</p><p className="mt-2 font-display text-3xl font-extrabold text-eco-900">{Math.round(totalCommission)} TND</p></article>
            <article className="eco-card"><p className="text-sm font-bold text-eco-600">Analyses IA</p><p className="mt-2 font-display text-3xl font-extrabold text-eco-900">{aiAnalyses}</p></article>
            <article className="eco-card"><p className="text-sm font-bold text-eco-600">Score IA moyen</p><p className="mt-2 font-display text-3xl font-extrabold text-eco-900">{averageAiScore}/100</p></article>
            <article className="eco-card"><p className="text-sm font-bold text-eco-600">CO₂ IA</p><p className="mt-2 font-display text-3xl font-extrabold text-eco-900">{totalCo2Ai} kg</p></article>
          </div>

          <article className="eco-card">
            <h2 className="font-display text-xl font-extrabold text-eco-900">Utilisateurs</h2>
            <div className="mt-3 grid gap-2 lg:grid-cols-2">
              {summary.users.map((user) => (
                <div key={user.id} className="rounded-xl bg-eco-50 px-3 py-2 text-sm font-semibold text-eco-800">
                  {user.name} - {user.email} - <span className="uppercase">{user.role}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="eco-card">
            <h2 className="font-display text-xl font-extrabold text-eco-900">Annonces à modérer</h2>
            <div className="mt-3 space-y-2">
              {summary.listings.slice(0, 10).map((listing) => (
                <Link key={listing.id} href={`/listings/${listing.id}`} className="block rounded-xl bg-eco-50 px-3 py-2 text-sm font-semibold text-eco-800">
                  {listing.title} - {listing.location} - {listing.availability}
                </Link>
              ))}
            </div>
          </article>
        </>
      ) : null}
    </section>
  )
}
