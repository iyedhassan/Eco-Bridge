import { NextRequest } from 'next/server'
import { createSessionToken, setAuthSessionCookie, verifyPassword } from '@/lib/auth'
import { findUserByEmail } from '@/lib/backend'
import { fail, ok } from '@/lib/http'
import { loginSchema } from '@/lib/validation'
import { serializeUser } from '@/lib/serializers'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) return fail('Invalid login payload', 422)

  const user = await findUserByEmail(parsed.data.email)
  if (!user) return fail('Invalid credentials', 401)

  const isValidPassword = await verifyPassword(parsed.data.password, user.passwordHash)
  if (!isValidPassword) return fail('Invalid credentials', 401)

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
