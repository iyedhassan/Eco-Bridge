import { NextRequest } from 'next/server'
import { createSessionToken, hashPassword, setAuthSessionCookie } from '@/lib/auth'
import { createUser, findUserByEmail } from '@/lib/backend'
import { fail, ok } from '@/lib/http'
import { signupSchema } from '@/lib/validation'
import { serializeUser } from '@/lib/serializers'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsed = signupSchema.safeParse(body)
  if (!parsed.success) return fail('Invalid signup payload', 422)

  const existing = await findUserByEmail(parsed.data.email)
  if (existing) return fail('Email already exists', 409)

  const passwordHash = await hashPassword(parsed.data.password)
  const user = await createUser({ ...parsed.data, passwordHash })
  const serialized = serializeUser(user)

  const token = await createSessionToken({
    sub: user.id,
    role: serialized.role,
    email: user.email,
    name: user.name,
  })
  await setAuthSessionCookie(token)

  return ok({ user: serialized })
}
