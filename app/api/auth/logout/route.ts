import { clearAuthSessionCookie } from '@/lib/auth'
import { ok } from '@/lib/http'

export async function POST() {
  await clearAuthSessionCookie()
  return ok({ loggedOut: true })
}
