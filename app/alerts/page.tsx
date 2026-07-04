'use client'

import { useEffect, useState } from 'react'
import { Notification } from '@/lib/types'
import { EmptyState } from '@/components/empty-state'
import { useLanguage } from '@/components/language-provider'

export default function AlertsPage() {
  const { dictionary } = useLanguage()
  const [alerts, setAlerts] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    const response = await fetch('/api/alerts')
    const data = await response.json()
    if (!response.ok || !data.ok) {
      setError(data.error || dictionary.alerts.error)
      setLoading(false)
      return
    }
    setAlerts(data.data)
    setLoading(false)
  }

  async function markAsRead(id: string) {
    await fetch('/api/alerts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await load()
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <section className="space-y-4 pb-10">
      <article className="eco-card">
        <h1 className="eco-title">{dictionary.alerts.title}</h1>
        <p className="eco-subtitle">{dictionary.alerts.subtitle}</p>
      </article>

      {error ? <article className="eco-card text-sm font-bold text-red-700">{error}</article> : null}
      {loading ? <article className="eco-card text-sm font-semibold text-eco-700">{dictionary.alerts.loading}</article> : null}

      {!loading && alerts.length === 0 ? (
        <EmptyState title={dictionary.alerts.emptyTitle} subtitle={dictionary.alerts.emptySubtitle} />
      ) : null}

      <div className="space-y-3">
        {alerts.map((alert) => (
          <article key={alert.id} className="eco-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eco-badge">{alert.type}</p>
                <h2 className="mt-2 font-display text-xl font-extrabold text-eco-900">{alert.title}</h2>
                <p className="mt-1 text-sm font-medium text-eco-700">{alert.message}</p>
              </div>

              {!alert.read ? (
                <button className="eco-button-secondary" type="button" onClick={() => void markAsRead(alert.id)}>
                  {dictionary.alerts.markRead}
                </button>
              ) : (
                <span className="text-xs font-bold text-eco-600">{dictionary.alerts.read}</span>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
