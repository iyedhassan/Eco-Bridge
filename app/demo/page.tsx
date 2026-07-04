import Link from 'next/link'
import { ArrowRight, BarChart3, ClipboardList, Handshake, Leaf, SearchCheck, Sparkles } from 'lucide-react'
import { getListings } from '@/lib/backend'
import { calculateListingImpact } from '@/lib/impact'
import { computeMatchScore } from '@/lib/matching'
import { Project } from '@/lib/types'

export default async function DemoPage() {
  const listings = await getListings({ location: 'Sfax' })
  const sampleListing = listings.find((listing: any) => listing.categoryId === 'plastic') ?? listings[0]
  const demoProject: Project = {
    id: 'demo_project',
    ownerId: 'demo_buyer',
    name: 'Emballages recyclés à partir de PET',
    industry: 'packaging',
    location: 'Sfax',
    needs: ['plastic', 'pet', 'emballage'],
    budgetLevel: 'medium',
    createdAt: new Date().toISOString(),
  }
  const score = sampleListing ? computeMatchScore({ listing: sampleListing, project: demoProject }) : null
  const impact = sampleListing ? calculateListingImpact(sampleListing) : null

  const steps = [
    {
      icon: ClipboardList,
      title: '1. Publication',
      text: 'Une entreprise publie un déchet industriel avec matière, quantité, prix, localisation et description.',
    },
    {
      icon: Sparkles,
      title: '2. Analyse IA',
      text: 'Gemini analyse la matière, estime la valeur, calcule le CO₂ évité et sauvegarde le résultat dans Prisma. Sans clé Gemini, le fallback local garde la démo fonctionnelle.',
    },
    {
      icon: SearchCheck,
      title: '3. Matching intelligent',
      text: 'L’algorithme compare matière, secteur, distance, quantité, prix, urgence et disponibilité.',
    },
    {
      icon: BarChart3,
      title: '4. Score explicable',
      text: score ? `Un badge « ${score.badge} » est affiché avec un score ${score.total}/100 et une explication claire.` : 'Un score sur 100 est affiché avec une explication claire.',
    },
    {
      icon: Leaf,
      title: '5. Impact mesuré',
      text: impact ? `${impact.wasteReusedKg} kg réutilisés, ${impact.co2ReductionKg} kg CO₂ évités et ${impact.moneySavedTnd} TND d’économie estimée.` : 'La plateforme calcule CO₂ évité, déchets réutilisés et économie estimée.',
    },
    {
      icon: Handshake,
      title: '6. Mise en relation',
      text: 'L’acheteur reçoit un message professionnel généré par l’IA pour contacter le vendeur et lancer la transaction.',
    },
  ]

  return (
    <section className="space-y-5 pb-10">
      <article className="eco-card overflow-hidden">
        <div className="rounded-3xl bg-gradient-to-br from-eco-900 to-eco-700 p-6 text-white">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em]">
            <Sparkles className="h-4 w-4" /> Parcours de démonstration jury
          </p>
          <h1 className="mt-3 font-display text-4xl font-extrabold">Démo fonctionnelle EcoBridge AI</h1>
          <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-white/90">
            Cette page transforme le prototype en scénario clair: publier un déchet, lancer l’analyse IA, obtenir un matching explicable, mesurer l’impact et contacter un acteur pertinent.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/listings/new" className="eco-button bg-white text-eco-900 hover:bg-eco-100">
              Publier un déchet <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link href="/advisor" className="eco-button-secondary border-white/30 bg-white/10 text-white hover:bg-white/20">
              Tester l’assistant IA
            </Link>
          </div>
        </div>
      </article>

      <div className="grid gap-4 lg:grid-cols-3">
        {steps.map((step) => {
          const Icon = step.icon
          return (
            <article key={step.title} className="eco-card">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-eco-100 text-eco-700">
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="mt-3 font-display text-xl font-extrabold text-eco-900">{step.title}</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-eco-700">{step.text}</p>
            </article>
          )
        })}
      </div>

      {sampleListing && score && impact ? (
        <article className="eco-card">
          <h2 className="font-display text-2xl font-extrabold text-eco-900">Exemple affichable pendant la présentation</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <section className="rounded-2xl bg-eco-50 p-4">
              <p className="text-sm font-extrabold text-eco-900">Annonce exemple</p>
              <h3 className="mt-2 text-lg font-extrabold text-eco-900">{sampleListing.title}</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-eco-700">{sampleListing.description}</p>
            </section>
            <section className="rounded-2xl bg-white p-4 ring-1 ring-eco-200">
              <p className="text-sm font-extrabold text-eco-900">Résultat Gemini / IA</p>
              <p className="mt-2 rounded-xl bg-eco-50 px-3 py-2 text-sm font-bold text-eco-800">Score matching: {score.total}/100 — {score.badge}</p>
              <p className="mt-2 rounded-xl bg-eco-50 px-3 py-2 text-sm font-bold text-eco-800">Score valorisation: {sampleListing.aiAnalysis?.valorizationScore || sampleListing.aiAnalysis?.confidenceScore || 87}/100</p>
              <p className="mt-2 rounded-xl bg-eco-50 px-3 py-2 text-sm font-bold text-eco-800">CO₂ évité: {Math.round(sampleListing.aiAnalysis?.co2SavedKg || impact.co2ReductionKg)} kg</p>
              <p className="mt-2 rounded-xl bg-eco-50 px-3 py-2 text-sm font-bold text-eco-800">Usages: {(sampleListing.aiAnalysis?.possibleUses || ['granulés recyclés', 'emballages recyclés']).slice(0, 2).join(', ')}</p>
              <p className="mt-2 text-xs font-semibold leading-5 text-eco-700">{sampleListing.aiAnalysis?.recommendationText || score.explanation}</p>
            </section>
          </div>
        </article>
      ) : null}
    </section>
  )
}
