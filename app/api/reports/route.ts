import { ok } from '@/lib/http'
import { requireSession } from '@/lib/session-guard'

export async function GET() {
  const guard = await requireSession(['ADMIN'])
  if (guard.error) return guard.error
  return ok([])
}
