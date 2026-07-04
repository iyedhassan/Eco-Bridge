'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/components/language-provider'

type Profile = {
  id: string
  name: string
  email: string
  role: string
  industry: string
  location: string
  memberSince: string
}

export default function ProfilePage() {
  const { dictionary, language } = useLanguage()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const response = await fetch('/api/profile')
      const data = await response.json()

      if (!response.ok || !data.ok) {
        setError(data.error || dictionary.profile.error)
        return
      }

      setProfile(data.data)
    }

    void load()
  }, [])

  return (
    <section className="space-y-4 pb-10">
      <article className="eco-card">
        <h1 className="eco-title">{dictionary.profile.title}</h1>
        <p className="eco-subtitle">{dictionary.profile.subtitle}</p>
      </article>

      {error ? <article className="eco-card text-sm font-bold text-red-700">{error}</article> : null}

      {!profile && !error ? <article className="eco-card text-sm font-semibold text-eco-700">{dictionary.profile.loading}</article> : null}

      {profile ? (
        <article className="eco-card space-y-3">
          <p className="rounded-xl bg-eco-50 px-3 py-2 text-sm font-semibold text-eco-800"><strong>{dictionary.profile.name}:</strong> {profile.name}</p>
          <p className="rounded-xl bg-eco-50 px-3 py-2 text-sm font-semibold text-eco-800"><strong>{dictionary.profile.email}:</strong> {profile.email}</p>
          <p className="rounded-xl bg-eco-50 px-3 py-2 text-sm font-semibold text-eco-800"><strong>{dictionary.profile.role}:</strong> {profile.role}</p>
          <p className="rounded-xl bg-eco-50 px-3 py-2 text-sm font-semibold text-eco-800"><strong>{dictionary.profile.industry}:</strong> {profile.industry}</p>
          <p className="rounded-xl bg-eco-50 px-3 py-2 text-sm font-semibold text-eco-800"><strong>{dictionary.profile.location}:</strong> {profile.location}</p>
          <p className="rounded-xl bg-eco-50 px-3 py-2 text-sm font-semibold text-eco-800"><strong>{dictionary.profile.memberSince}:</strong> {new Date(profile.memberSince).toLocaleDateString(language)}</p>
        </article>
      ) : null}
    </section>
  )
}
