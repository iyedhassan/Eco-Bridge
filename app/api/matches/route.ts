import { NextRequest } from 'next/server'
import { createMaterialNeedAndMatches, getMatchesForUser } from '@/lib/backend'
import { fail, ok } from '@/lib/http'
import { requireSession } from '@/lib/session-guard'
import { materialNeedSchema } from '@/lib/validation'

export async function GET() {
  const guard = await requireSession()
  if (guard.error) return guard.error
  return ok(await getMatchesForUser(guard.session.sub))
}

export async function POST(request: NextRequest) {
  const guard = await requireSession(['STARTUP', 'ENTREPRENEUR', 'ADMIN'])
  if (guard.error) return guard.error

  const body = await request.json().catch(() => null)
  const parsed = materialNeedSchema.safeParse(body)
  if (!parsed.success) return fail('Invalid material need payload', 422)

  const result = await createMaterialNeedAndMatches(guard.session.sub, parsed.data)
  return ok(result)
}
