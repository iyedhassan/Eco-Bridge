'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Message } from '@/lib/types'

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [form, setForm] = useState({ receiverId: '', body: '' })
  const [error, setError] = useState('')

  async function load() {
    const response = await fetch('/api/messages')
    const data = await response.json()
    if (!response.ok || !data.ok) setError(data.error || 'Connexion requise')
    else setMessages(data.data)
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setForm({ receiverId: '', body: '' })
    await load()
  }

  useEffect(() => { void load() }, [])

  return (
    <section className="space-y-4 pb-10">
      <article className="eco-card">
        <h1 className="eco-title">Messagerie interne</h1>
        <p className="eco-subtitle">Messages sauvegardés en base, liés aux échanges entre vendeurs et acheteurs.</p>
      </article>

      {error ? <article className="eco-card text-sm font-bold text-red-700">{error}</article> : null}

      <form onSubmit={submit} className="eco-card grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
        <input value={form.receiverId} onChange={(e) => setForm((c) => ({ ...c, receiverId: e.target.value }))} placeholder="ID destinataire" className="rounded-xl border border-eco-200 px-3 py-2 font-semibold text-eco-900" />
        <input value={form.body} onChange={(e) => setForm((c) => ({ ...c, body: e.target.value }))} placeholder="Message" className="rounded-xl border border-eco-200 px-3 py-2 font-semibold text-eco-900" />
        <button className="eco-button" type="submit">Envoyer</button>
      </form>

      <div className="space-y-3">
        {messages.map((message) => (
          <article key={message.id} className="eco-card">
            <p className="text-xs font-bold text-eco-600">De {message.fromUserId} vers {message.toUserId}</p>
            <p className="mt-2 text-sm font-semibold text-eco-800">{message.body}</p>
            <p className="mt-2 text-xs font-bold text-eco-500">{new Date(message.createdAt).toLocaleString()}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
