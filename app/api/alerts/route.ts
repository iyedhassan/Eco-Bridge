import { NextRequest } from 'next/server'
import { getNotifications, markNotificationRead } from '@/lib/backend'
import { fail, ok } from '@/lib/http'
import { requireSession } from '@/lib/session-guard'

export async function GET() {
  const guard = await requireSession()
  if (guard.error) return guard.error
  return ok(await getNotifications(guard.session.sub))
}

export async function PATCH(request: NextRequest) {
  const guard = await requireSession()
  if (guard.error) return guard.error
  const body = await request.json().catch(() => null)
  if (!body?.id) return fail('Missing notification id', 422)
  try {
    const notification = await markNotificationRead(guard.session.sub, body.id)
    return ok(notification)
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Notification update failed', 400)
  }
}
