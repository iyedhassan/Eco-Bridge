'use client'

import Link from 'next/link'
import { ArrowRight, Factory, Leaf, Search, ShieldCheck, Sparkles } from 'lucide-react'
import { useLanguage } from '@/components/language-provider'

const highlightIcons = [Sparkles, Factory, Leaf]

export default function LandingPage() {
  const { dictionary } = useLanguage()

  return (
    <section className="space-y-8 pb-12">
      <article className="relative overflow-hidden rounded-3xl border border-eco-200 bg-gradient-to-br from-eco-900 via-eco-800 to-eco-700 p-8 text-white shadow-[0_28px_54px_rgba(13,52,36,0.35)]">
        <div className="absolute -right-14 -top-16 h-48 w-48 rounded-full bg-eco-300/20 blur-3xl" />
        <div className="absolute -bottom-16 left-0 h-44 w-44 rounded-full bg-white/15 blur-3xl" />

        <div className="relative max-w-3xl space-y-5">
          <p className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em]">
            {dictionary.home.badge}
          </p>

          <h1 className="font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            {dictionary.home.title}
          </h1>

          <p className="max-w-2xl text-base font-medium leading-7 text-white/90 sm:text-lg">
            {dictionary.home.subtitle}
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href="/marketplace" className="eco-button bg-white text-eco-900 hover:bg-eco-100">
              {dictionary.home.ctaMarketplace}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link href="/advisor" className="eco-button-secondary border-white/30 bg-white/10 text-white hover:bg-white/20">
              {dictionary.home.ctaAdvisor}
            </Link>
          </div>
        </div>
      </article>

      <section className="grid gap-4 md:grid-cols-3">
        {dictionary.home.highlights.map((item, index) => {
          const Icon = highlightIcons[index] ?? Sparkles
          return (
            <article key={item.title} className="eco-card">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-eco-100 text-eco-700">
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="mt-3 font-display text-xl font-extrabold text-eco-900">{item.title}</h2>
              <p className="mt-2 text-sm font-medium text-eco-700">{item.text}</p>
            </article>
          )
        })}
      </section>

      <section className="eco-card">
        <h2 className="font-display text-2xl font-extrabold text-eco-900">{dictionary.home.howItWorks}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {dictionary.home.steps.map((step) => (
            <div key={step.title} className="rounded-2xl bg-eco-50 p-4">
              <p className="mt-1 font-semibold text-eco-900">{step.title}</p>
              <p className="mt-1 text-sm text-eco-700">{step.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/auth/signup" className="eco-button">
            {dictionary.home.startFree}
          </Link>
          <Link href="/dashboard" className="eco-button-secondary">
            {dictionary.home.sampleDashboard}
          </Link>
          <Link href="/alerts" className="eco-button-secondary">
            <Search className="mr-2 h-4 w-4" />
            {dictionary.home.seeAlerts}
          </Link>
          <span className="inline-flex items-center rounded-xl bg-eco-100 px-3 py-2 text-sm font-bold text-eco-700">
            <ShieldCheck className="mr-2 h-4 w-4" />
            {dictionary.home.trust}
          </span>
        </div>
      </section>
    </section>
  )
}
