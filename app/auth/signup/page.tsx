'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/components/language-provider'

export default function SignupPage() {
  const { dictionary } = useLanguage()
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STARTUP',
    industry: '',
    location: 'Tunis',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await response.json()
      if (!response.ok || !data.ok) {
        setError(data.error || dictionary.auth.signupFailed)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError(dictionary.auth.signupNetworkError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-2xl space-y-4">
      <article className="eco-card">
        <h1 className="eco-title">{dictionary.auth.signupTitle}</h1>
        <p className="eco-subtitle">{dictionary.auth.signupSubtitle}</p>

        <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <label className="space-y-1 sm:col-span-2">
            <span className="text-sm font-bold text-eco-800">{dictionary.auth.name}</span>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-xl border border-eco-200 px-3 py-2 font-semibold text-eco-900"
              required
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-bold text-eco-800">{dictionary.auth.email}</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              className="w-full rounded-xl border border-eco-200 px-3 py-2 font-semibold text-eco-900"
              required
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-bold text-eco-800">{dictionary.auth.password}</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              className="w-full rounded-xl border border-eco-200 px-3 py-2 font-semibold text-eco-900"
              required
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-bold text-eco-800">{dictionary.auth.role}</span>
            <select
              value={form.role}
              onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
              className="w-full rounded-xl border border-eco-200 px-3 py-2 font-semibold text-eco-900"
            >
              <option value="STARTUP">Startup / PME</option>
              <option value="INDUSTRIAL_COMPANY">Entreprise industrielle</option>
              <option value="ENTREPRENEUR">Jeune entrepreneur</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm font-bold text-eco-800">{dictionary.auth.industry}</span>
            <input
              value={form.industry}
              onChange={(event) => setForm((current) => ({ ...current, industry: event.target.value }))}
              className="w-full rounded-xl border border-eco-200 px-3 py-2 font-semibold text-eco-900"
              required
            />
          </label>

          <label className="space-y-1 sm:col-span-2">
            <span className="text-sm font-bold text-eco-800">{dictionary.auth.location}</span>
            <input
              value={form.location}
              onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
              className="w-full rounded-xl border border-eco-200 px-3 py-2 font-semibold text-eco-900"
              required
            />
          </label>

          {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700 sm:col-span-2">{error}</p> : null}

          <button type="submit" className="eco-button sm:col-span-2" disabled={loading}>
            {loading ? dictionary.auth.creating : dictionary.auth.createAccount}
          </button>
        </form>
      </article>
    </section>
  )
}
