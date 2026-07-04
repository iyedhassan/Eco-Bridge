'use client'

import { ChangeEvent } from 'react'
import { languageOptions } from '@/lib/i18n'
import { useLanguage } from '@/components/language-provider'

export function LanguageSwitcher() {
  const { language, setLanguage, dictionary } = useLanguage()

  const onChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selected = event.target.value
    if (selected === 'en' || selected === 'fr' || selected === 'ar') {
      setLanguage(selected)
    }
  }

  return (
    <label className="inline-flex items-center gap-2 rounded-xl border border-eco-200 bg-white px-2 py-1 text-sm font-semibold text-eco-800">
      <span className="sr-only">{dictionary.header.language}</span>
      <select
        aria-label={dictionary.header.language}
        value={language}
        onChange={onChange}
        className="bg-transparent text-sm font-semibold text-eco-800 outline-none"
      >
        {languageOptions.map((option) => (
          <option key={option.code} value={option.code}>
            {option.short}
          </option>
        ))}
      </select>
    </label>
  )
}
