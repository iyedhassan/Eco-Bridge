import { getServerSession } from './auth'
import { fail } from './http'
import { UserRole } from './types'

export async function requireSession(allowedRoles?: UserRole[]) {
  const session = await getServerSession()
  if (!session) {
    return { error: fail('Unauthorized', 401) }
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    return { error: fail('Forbidden', 403) }
  }

  return { session }
}
