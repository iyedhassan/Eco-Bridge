import { getServerSession } from '@/lib/auth'
import { findUserById } from '@/lib/backend'
import { fail, ok } from '@/lib/http'
import { serializeUser } from '@/lib/serializers'

export async function GET() {
  const session = await getServerSession()
  if (!session) return fail('Unauthorized', 401)

  const user = await findUserById(session.sub)
  if (!user) return fail('User not found', 404)

  return ok(serializeUser(user))
}
