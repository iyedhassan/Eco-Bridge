'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/components/language-provider'

export default function LoginPage() {
  const { dictionary } = useLanguage()
  const router = useRouter()
  const [email, setEmail] = useState('buyer@monastirfurn.tn')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      if (!response.ok || !data.ok) {
        setError(data.error || dictionary.auth.loginFailed)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError(dictionary.auth.loginNetworkError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-lg space-y-4">
      <article className="eco-card">
        <h1 className="eco-title">{dictionary.auth.loginTitle}</h1>
        <p className="eco-subtitle">{dictionary.auth.loginSubtitle}</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-1">
            <span className="text-sm font-bold text-eco-800">{dictionary.auth.email}</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-eco-200 px-3 py-2 font-semibold text-eco-900"
              required
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-bold text-eco-800">{dictionary.auth.password}</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-eco-200 px-3 py-2 font-semibold text-eco-900"
              required
            />
          </label>

          {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p> : null}

          <button type="submit" className="eco-button w-full" disabled={loading}>
            {loading ? dictionary.auth.signingIn : dictionary.auth.signIn}
          </button>
        </form>
      </article>
    </section>
  )
}
