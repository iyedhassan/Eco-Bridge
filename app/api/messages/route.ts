import { NextRequest } from 'next/server'
import { getMessages, sendMessage } from '@/lib/backend'
import { fail, ok } from '@/lib/http'
import { requireSession } from '@/lib/session-guard'
import { messageSchema } from '@/lib/validation'

export async function GET() {
  const guard = await requireSession()
  if (guard.error) return guard.error
  return ok(await getMessages(guard.session.sub))
}

export async function POST(request: NextRequest) {
  const guard = await requireSession()
  if (guard.error) return guard.error
  const body = await request.json().catch(() => null)
  const parsed = messageSchema.safeParse(body)
  if (!parsed.success) return fail('Invalid message payload', 422)
  return ok(await sendMessage(guard.session.sub, parsed.data), { status: 201 })
}
