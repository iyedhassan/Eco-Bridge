'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { AppDictionary, AppLanguage, getDictionary, isRtlLanguage, LANGUAGE_COOKIE_KEY, normalizeLanguage } from '@/lib/i18n'

type LanguageContextValue = {
  language: AppLanguage
  setLanguage: (language: AppLanguage) => void
  dictionary: AppDictionary
  direction: 'ltr' | 'rtl'
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({
  children,
  initialLanguage,
}: {
  children: React.ReactNode
  initialLanguage?: AppLanguage
}) {
  const [language, setLanguageState] = useState<AppLanguage>(normalizeLanguage(initialLanguage))

  useEffect(() => {
    const browserStored = window.localStorage.getItem(LANGUAGE_COOKIE_KEY)
    const cookieMatch = document.cookie
      .split(';')
      .map((item) => item.trim())
      .find((item) => item.startsWith(`${LANGUAGE_COOKIE_KEY}=`))

    const cookieValue = cookieMatch ? decodeURIComponent(cookieMatch.split('=')[1] ?? '') : undefined
    const nextLanguage = normalizeLanguage(browserStored || cookieValue || initialLanguage)
    setLanguageState(nextLanguage)
  }, [initialLanguage])

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_COOKIE_KEY, language)
    document.cookie = `${LANGUAGE_COOKIE_KEY}=${encodeURIComponent(language)}; path=/; max-age=31536000; samesite=lax`
    document.documentElement.lang = language
    document.documentElement.dir = isRtlLanguage(language) ? 'rtl' : 'ltr'
  }, [language])

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage: setLanguageState,
      dictionary: getDictionary(language),
      direction: isRtlLanguage(language) ? 'rtl' : 'ltr',
    }),
    [language],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
