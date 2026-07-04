'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart3, CheckCircle2, Leaf, Loader2, Sparkles } from 'lucide-react'
import { AiWasteAnalysis, EnvironmentalImpact } from '@/lib/types'
import { useLanguage } from '@/components/language-provider'

type ListingFormState = {
  title: string
  materialId: string
  materialType: string
  categoryId: string
  industry: string
  quantity: number
  unit: string
  pricePerUnit: number
  location: string
  availability: 'available' | 'reserved' | 'sold'
  urgency: 'low' | 'medium' | 'high'
  description: string
  photos: string[]
}

const initialForm: ListingFormState = {
  title: '',
  materialId: 'mat_pet_scrap',
  materialType: 'PET Plastic Scrap',
  categoryId: 'plastic',
  industry: 'packaging',
  quantity: 100,
  unit: 'kg',
  pricePerUnit: 1,
  location: 'Sfax',
  availability: 'available',
  urgency: 'medium',
  description: '',
  photos: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab'],
}

export default function CreateListingPage() {
  const { dictionary, language } = useLanguage()
  const router = useRouter()
  const [form, setForm] = useState<ListingFormState>(initialForm)
  const [analysis, setAnalysis] = useState<AiWasteAnalysis | null>(null)
  const [impact, setImpact] = useState<EnvironmentalImpact | null>(null)
  const [aiSource, setAiSource] = useState<'gemini' | 'fallback' | null>(null)
  const [error, setError] = useState('')
  const [aiError, setAiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  const analyzeWithAi = async () => {
    setAiError('')
    setAnalyzing(true)

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          title: form.title || `Lot de ${form.materialType}`,
          description: form.description || `Lot industriel de ${form.materialType} disponible à ${form.location}`,
          quantity: Number(form.quantity),
          pricePerUnit: Number(form.pricePerUnit),
        }),
      })
      const data = await response.json()

      if (!response.ok || !data.ok) {
        setAiError(data.error || 'Impossible de lancer l’analyse IA.')
        return
      }

      const nextAnalysis = data.data.analysis as AiWasteAnalysis
      const nextImpact = data.data.impactEstimate as EnvironmentalImpact
      setAnalysis(nextAnalysis)
      setImpact(nextImpact)
      setAiSource(data.data.source)
      setForm((current) => ({
        ...current,
        title: nextAnalysis.suggestedTitle,
        materialType: nextAnalysis.materialType,
        categoryId: nextAnalysis.categoryId,
        description: nextAnalysis.improvedDescription,
      }))
    } catch {
      setAiError('Erreur réseau pendant l’analyse IA.')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity),
          pricePerUnit: Number(form.pricePerUnit),
          aiAnalysis: analysis ?? undefined,
          impactEstimate: impact ?? undefined,
        }),
      })
      const data = await response.json()

      if (!response.ok || !data.ok) {
        if (response.status === 401) {
          setError(language === 'ar' ? 'لازمك تعمل تسجيل دخول قبل نشر العرض.' : dictionary.createListing.createError)
          return
        }

        if (response.status === 403 || data.error === 'Forbidden') {
          setError(language === 'ar' ? 'حسابك ما عندوش الصلاحية الكافية حاليا.' : dictionary.createListing.createError)
          return
        }

        setError(data.error || dictionary.createListing.createError)
        return
      }

      router.push('/marketplace')
      router.refresh()
    } catch {
      setError(dictionary.createListing.createNetworkError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-5xl space-y-4 pb-10">
      <article className="eco-card overflow-hidden">
        <div className="rounded-3xl bg-gradient-to-br from-eco-900 to-eco-700 p-5 text-white">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em]">
            <Sparkles className="h-4 w-4" /> Publication assistée par IA
          </p>
          <h1 className="mt-3 font-display text-3xl font-extrabold">{dictionary.createListing.title}</h1>
          <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-white/90">
            {dictionary.createListing.subtitle} L’IA propose un titre professionnel, améliore la description, identifie les usages et estime l’impact environnemental.
          </p>
        </div>

        <form className="mt-5 grid gap-3 sm:grid-cols-2" onSubmit={handleSubmit}>
          <label className="space-y-1 sm:col-span-2">
            <span className="text-sm font-bold text-eco-800">{dictionary.createListing.labels.title}</span>
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              className="w-full rounded-xl border border-eco-200 px-3 py-2 font-semibold text-eco-900"
              placeholder="Ex: Lot de PET trié disponible à Sfax"
              required
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-bold text-eco-800">{dictionary.createListing.labels.materialType}</span>
            <input
              value={form.materialType}
              onChange={(event) => setForm((current) => ({ ...current, materialType: event.target.value }))}
              className="w-full rounded-xl border border-eco-200 px-3 py-2 font-semibold text-eco-900"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-bold text-eco-800">{dictionary.createListing.labels.category}</span>
            <select
              value={form.categoryId}
              onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))}
              className="w-full rounded-xl border border-eco-200 px-3 py-2 font-semibold text-eco-900"
            >
              <option value="plastic">plastic</option>
              <option value="metal">metal</option>
              <option value="wood">wood</option>
              <option value="textile">textile</option>
              <option value="paper">paper</option>
              <option value="oil">oil</option>
              <option value="organic">organic</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm font-bold text-eco-800">Secteur industriel</span>
            <input
              value={form.industry}
              onChange={(event) => setForm((current) => ({ ...current, industry: event.target.value }))}
              className="w-full rounded-xl border border-eco-200 px-3 py-2 font-semibold text-eco-900"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-bold text-eco-800">{dictionary.createListing.labels.quantity}</span>
            <input
              type="number"
              value={form.quantity}
              onChange={(event) => setForm((current) => ({ ...current, quantity: Number(event.target.value) }))}
              className="w-full rounded-xl border border-eco-200 px-3 py-2 font-semibold text-eco-900"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-bold text-eco-800">{dictionary.createListing.labels.unit}</span>
            <input
              value={form.unit}
              onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value }))}
              className="w-full rounded-xl border border-eco-200 px-3 py-2 font-semibold text-eco-900"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-bold text-eco-800">{dictionary.createListing.labels.pricePerUnit}</span>
            <input
              type="number"
              step="0.01"
              value={form.pricePerUnit}
              onChange={(event) => setForm((current) => ({ ...current, pricePerUnit: Number(event.target.value) }))}
              className="w-full rounded-xl border border-eco-200 px-3 py-2 font-semibold text-eco-900"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-bold text-eco-800">{dictionary.createListing.labels.location}</span>
            <input
              value={form.location}
              onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
              className="w-full rounded-xl border border-eco-200 px-3 py-2 font-semibold text-eco-900"
            />
          </label>

          <label className="space-y-1 sm:col-span-2">
            <span className="text-sm font-bold text-eco-800">{dictionary.createListing.labels.description}</span>
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="min-h-28 w-full rounded-xl border border-eco-200 px-3 py-2 font-semibold text-eco-900"
              placeholder="Décrivez la matière, son état, sa fréquence et les conditions de stockage."
            />
          </label>

          <div className="sm:col-span-2 grid gap-3 rounded-2xl border border-dashed border-eco-300 bg-eco-50 p-4 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-sm font-extrabold text-eco-900">Analyse IA du déchet industriel</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-eco-700">
                Le bouton analyse la matière, estime la valeur, propose des secteurs intéressés et prépare l’annonce pour la marketplace.
              </p>
            </div>
            <button type="button" className="eco-button" onClick={analyzeWithAi} disabled={analyzing}>
              {analyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {analyzing ? 'Analyse en cours...' : 'Analyser avec IA'}
            </button>
          </div>

          {aiError ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700 sm:col-span-2">{aiError}</p> : null}

          {analysis && impact ? (
            <section className="sm:col-span-2 grid gap-3 lg:grid-cols-3">
              <article className="rounded-2xl border border-eco-200 bg-white p-4">
                <p className="inline-flex items-center gap-2 text-sm font-extrabold text-eco-900"><CheckCircle2 className="h-4 w-4 text-eco-600" /> Résumé IA</p>
                <p className="mt-2 text-xs font-semibold text-eco-700">Source: {aiSource === 'gemini' ? 'Gemini' : 'Fallback intelligent'}</p>
                <p className="mt-2 text-sm font-bold text-eco-800">Score: {analysis.valorizationScore || analysis.confidenceScore}/100 · Source: {aiSource === 'gemini' ? 'Gemini' : 'Fallback'}</p>
                <p className="mt-2 text-sm font-semibold leading-5 text-eco-700">{analysis.recommendationText || analysis.recommendation}</p>
              </article>

              <article className="rounded-2xl border border-eco-200 bg-white p-4">
                <p className="inline-flex items-center gap-2 text-sm font-extrabold text-eco-900"><BarChart3 className="h-4 w-4 text-eco-600" /> Valeur estimée</p>
                <p className="mt-2 text-sm font-bold text-eco-800">{analysis.estimatedPriceRange}</p>
                <p className="mt-2 text-xs font-semibold leading-5 text-eco-700">Risque qualité: {analysis.riskLevel || analysis.qualityRisk}</p>
              </article>

              <article className="rounded-2xl border border-eco-200 bg-white p-4">
                <p className="inline-flex items-center gap-2 text-sm font-extrabold text-eco-900"><Leaf className="h-4 w-4 text-eco-600" /> Impact</p>
                <p className="mt-2 text-sm font-bold text-eco-800">{impact.co2ReductionKg} kg CO₂ évités</p>
                <p className="mt-1 text-sm font-bold text-eco-800">{impact.wasteReusedKg} kg réutilisés</p>
                <p className="mt-1 text-sm font-bold text-eco-800">{impact.moneySavedTnd} TND économie estimée</p>
              </article>

              <article className="rounded-2xl border border-eco-200 bg-eco-50 p-4 lg:col-span-3">
                <p className="text-sm font-extrabold text-eco-900">Usages possibles et secteurs intéressés</p>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <ul className="space-y-1 text-sm font-semibold text-eco-800">
                    {analysis.possibleUses.map((item) => <li key={item}>• {item}</li>)}
                  </ul>
                  <ul className="space-y-1 text-sm font-semibold text-eco-800">
                    {analysis.interestedSectors.map((item) => <li key={item}>• {item}</li>)}
                  </ul>
                </div>
              </article>
            </section>
          ) : null}

          {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700 sm:col-span-2">{error}</p> : null}

          <button className="eco-button sm:col-span-2" type="submit" disabled={loading}>
            {loading ? dictionary.createListing.publishing : dictionary.createListing.publish}
          </button>
        </form>
      </article>
    </section>
  )
}
