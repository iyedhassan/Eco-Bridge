import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { AppHeader } from '@/components/app-header'
import { LanguageProvider } from '@/components/language-provider'
import { isRtlLanguage, LANGUAGE_COOKIE_KEY, normalizeLanguage } from '@/lib/i18n'
import './globals.css'

export const metadata: Metadata = {
  title: 'EcoBridge AI',
  description: 'AI-powered circular marketplace for industrial byproducts and recyclable materials.',
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies()
  const initialLanguage = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE_KEY)?.value)

  return (
    <html lang={initialLanguage} dir={isRtlLanguage(initialLanguage) ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body>
        <LanguageProvider initialLanguage={initialLanguage}>
          <AppHeader />
          <main className="eco-container py-6">{children}</main>
        </LanguageProvider>
      </body>
    </html>
  )
}
