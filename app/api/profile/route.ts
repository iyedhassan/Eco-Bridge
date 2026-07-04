import { NextRequest } from 'next/server'
import { getProfile, updateProfile } from '@/lib/backend'
import { fail, ok } from '@/lib/http'
import { requireSession } from '@/lib/session-guard'
import { profileSchema } from '@/lib/validation'

export async function GET() {
  const guard = await requireSession()
  if (guard.error) return guard.error
  const profile = await getProfile(guard.session.sub)
  if (!profile) return fail('User not found', 404)
  return ok(profile)
}

export async function PUT(request: NextRequest) {
  const guard = await requireSession()
  if (guard.error) return guard.error
  const body = await request.json().catch(() => null)
  const parsed = profileSchema.safeParse(body)
  if (!parsed.success) return fail('Invalid profile payload', 422)
  const profile = await updateProfile(guard.session.sub, parsed.data)
  return ok(profile)
}
