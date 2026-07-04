'use client'

import { useEffect, useState } from 'react'
import { BarChart3, BellRing, Bookmark, ChartNoAxesCombined, Leaf, Recycle, Sparkles } from 'lucide-react'
import { DashboardStats } from '@/lib/types'
import { StatCard } from '@/components/stat-card'
import { useLanguage } from '@/components/language-provider'

export default function DashboardPage() {
  const { dictionary } = useLanguage()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const response = await fetch('/api/dashboard')
      const data = await response.json()
      if (!response.ok || !data.ok) {
        setError(data.error || dictionary.dashboard.loginRequired)
        return
      }
      setStats(data.data)
    }

    void load()
  }, [dictionary.dashboard.loginRequired])

  return (
    <section className="space-y-4 pb-10">
      <article className="eco-card overflow-hidden">
        <div className="rounded-3xl bg-gradient-to-br from-eco-900 to-eco-700 p-5 text-white">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em]">
            <BarChart3 className="h-4 w-4" /> Impact & performance
          </p>
          <h1 className="mt-3 font-display text-3xl font-extrabold">{dictionary.dashboard.title}</h1>
          <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-white/90">
            {dictionary.dashboard.subtitle} Les KPI affichent les opportunités détectées, la valeur économique et l’impact CO₂ estimé par matière.
          </p>
        </div>
      </article>

      {error ? <article className="eco-card text-sm font-bold text-red-700">{error}</article> : null}
      {!stats && !error ? <article className="eco-card text-sm font-semibold text-eco-700">{dictionary.dashboard.loading}</article> : null}

      {stats ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title={dictionary.dashboard.stats.totalListings} value={String(stats.totalListings)} icon={<ChartNoAxesCombined className="h-5 w-5 text-eco-600" />} />
            <StatCard title={dictionary.dashboard.stats.matchedOpportunities} value={String(stats.matchedOpportunities)} icon={<Leaf className="h-5 w-5 text-eco-600" />} />
            <StatCard title="Demandes reçues" value={String(stats.receivedRequests ?? 0)} icon={<Bookmark className="h-5 w-5 text-eco-600" />} />
            <StatCard title="Demandes envoyées" value={String(stats.sentRequests ?? 0)} icon={<BellRing className="h-5 w-5 text-eco-600" />} />
            <StatCard title="Favoris" value={String(stats.savedSearches)} icon={<Bookmark className="h-5 w-5 text-eco-600" />} />
            <StatCard title={dictionary.dashboard.stats.unreadAlerts} value={String(stats.alerts)} icon={<BellRing className="h-5 w-5 text-eco-600" />} />
            <StatCard title="Transactions" value={String(stats.transactions ?? 0)} icon={<ChartNoAxesCombined className="h-5 w-5 text-eco-600" />} />
            <StatCard title="Commission 5 %" value={`${stats.totalCommissionTnd ?? 0} TND`} icon={<Leaf className="h-5 w-5 text-eco-600" />} />
            <StatCard title="Analyses IA" value={String(stats.aiAnalyses ?? 0)} icon={<Recycle className="h-5 w-5 text-eco-600" />} />
            <StatCard title="Score IA moyen" value={`${stats.averageValorizationScore ?? 0}/100`} icon={<BarChart3 className="h-5 w-5 text-eco-600" />} />
            <StatCard title="À analyser" value={String(stats.unanalysedListings ?? 0)} icon={<Sparkles className="h-5 w-5 text-eco-600" />} />
          </div>

          <article className="eco-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-extrabold text-eco-900">{dictionary.dashboard.ecoImpactTitle}</h2>
                <p className="mt-1 text-sm font-semibold text-eco-700">
                  Estimation automatique avec coefficients CO₂ par matière: plastique 1.8, métal 2.5, bois 0.9, textile 1.4, papier/carton 1.1.
                </p>
              </div>
              <span className="rounded-full bg-eco-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-eco-700">Calcul IA + règles métier</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <p className="rounded-xl bg-eco-50 px-3 py-3 text-sm font-bold text-eco-800">{dictionary.dashboard.wasteReused}: <span className="block text-2xl text-eco-900">{stats.ecoImpact.wasteReusedKg} kg</span></p>
              <p className="rounded-xl bg-eco-50 px-3 py-3 text-sm font-bold text-eco-800">{dictionary.dashboard.co2Reduction}: <span className="block text-2xl text-eco-900">{stats.ecoImpact.co2ReductionKg} kg</span></p>
              <p className="rounded-xl bg-eco-50 px-3 py-3 text-sm font-bold text-eco-800">{dictionary.dashboard.moneySaved}: <span className="block text-2xl text-eco-900">{stats.ecoImpact.moneySavedTnd} TND</span></p>
              <p className="rounded-xl bg-eco-50 px-3 py-3 text-sm font-bold text-eco-800">Stockage évité: <span className="block text-2xl text-eco-900">{stats.ecoImpact.storageAvoidedKg} kg</span></p>
            </div>
          </article>

          <article className="grid gap-4 lg:grid-cols-3">
            <div className="eco-card lg:col-span-2">
              <h3 className="font-display text-xl font-extrabold text-eco-900">Lecture jury</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-eco-700">
                Le dashboard ne montre pas seulement des annonces: il transforme chaque opportunité en indicateurs mesurables. Cela rend la valeur environnementale visible et comparable avant la transaction.
              </p>
            </div>
            <div className="eco-card">
              <p className="inline-flex items-center gap-2 text-sm font-extrabold text-eco-900"><Recycle className="h-4 w-4 text-eco-600" /> Modèle économique</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-eco-700">Commission de 5 % sur les transactions validées, avec bénéfice aligné sur la réduction des déchets.</p>
            </div>
          </article>
        </>
      ) : null}
    </section>
  )
}
