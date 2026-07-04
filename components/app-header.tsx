'use client'

import Link from 'next/link'
import { Leaf, Bell, LayoutDashboard, Store, PlusSquare, Bot, Sparkles, Handshake, MessageCircle } from 'lucide-react'
import { LanguageSwitcher } from '@/components/language-switcher'
import { useLanguage } from '@/components/language-provider'

export function AppHeader() {
  const { dictionary } = useLanguage()
  const navItems = [
    { href: '/marketplace', label: dictionary.header.nav.marketplace, icon: Store },
    { href: '/advisor', label: dictionary.header.nav.advisor, icon: Bot },
    { href: '/demo', label: 'Démo IA', icon: Sparkles },
    { href: '/listings/new', label: dictionary.header.nav.createListing, icon: PlusSquare },
    { href: '/dashboard', label: dictionary.header.nav.dashboard, icon: LayoutDashboard },
    { href: '/requests', label: 'Demandes', icon: Handshake },
    { href: '/messages', label: 'Messages', icon: MessageCircle },
    { href: '/alerts', label: dictionary.header.nav.alerts, icon: Bell },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-eco-100/80 bg-white/85 backdrop-blur">
      <div className="eco-container flex h-16 items-center justify-between gap-3">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-eco-600 text-white">
            <Leaf className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-display text-xl font-extrabold text-eco-900">EcoBridge AI</span>
            <span className="block text-xs font-semibold text-eco-700">{dictionary.header.subtitle}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-eco-700 transition hover:bg-eco-100"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link href="/auth/login" className="eco-button-secondary">
            {dictionary.header.login}
          </Link>
          <Link href="/auth/signup" className="eco-button">
            {dictionary.header.signup}
          </Link>
        </div>
      </div>
    </header>
  )
}
