import Link from 'next/link'
import { cookies } from 'next/headers'
import { getDictionary, normalizeLanguage, LANGUAGE_COOKIE_KEY } from '@/lib/i18n'

export default async function NotFound() {
  const cookieStore = await cookies()
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE_KEY)?.value)
  const dictionary = getDictionary(language)

  return (
    <section className="mx-auto max-w-xl py-16 text-center">
      <article className="eco-card">
        <h1 className="font-display text-4xl font-extrabold text-eco-900">{dictionary.common.notFound}</h1>
        <p className="mt-2 text-sm font-semibold text-eco-700">{dictionary.common.notFoundSubtitle}</p>
        <Link href="/" className="eco-button mt-5">
          {dictionary.common.backHome}
        </Link>
      </article>
    </section>
  )
}
