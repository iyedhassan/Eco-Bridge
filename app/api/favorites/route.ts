import { NextRequest } from 'next/server'
import { getFavorites, toggleFavorite } from '@/lib/backend'
import { fail, ok } from '@/lib/http'
import { requireSession } from '@/lib/session-guard'
import { favoriteSchema } from '@/lib/validation'

export async function GET() {
  const guard = await requireSession()
  if (guard.error) return guard.error
  return ok(await getFavorites(guard.session.sub))
}

export async function POST(request: NextRequest) {
  const guard = await requireSession()
  if (guard.error) return guard.error
  const body = await request.json().catch(() => null)
  const parsed = favoriteSchema.safeParse(body)
  if (!parsed.success) return fail('Invalid favorite payload', 422)
  return ok(await toggleFavorite(guard.session.sub, parsed.data.listingId))
}
