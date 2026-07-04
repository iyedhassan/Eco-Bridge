import { NextRequest } from 'next/server'
import { createRequest, getRequests, updateRequestStatus } from '@/lib/backend'
import { fail, ok } from '@/lib/http'
import { requireSession } from '@/lib/session-guard'
import { requestSchema, requestStatusSchema } from '@/lib/validation'

export async function GET() {
  const guard = await requireSession()
  if (guard.error) return guard.error
  return ok(await getRequests(guard.session.sub))
}

export async function POST(request: NextRequest) {
  const guard = await requireSession(['STARTUP', 'ENTREPRENEUR', 'ADMIN'])
  if (guard.error) return guard.error
  const body = await request.json().catch(() => null)
  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) return fail('Invalid request payload', 422)
  try {
    const result = await createRequest(guard.session.sub, parsed.data)
    return ok(result, { status: 201 })
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Request failed', 400)
  }
}

export async function PATCH(request: NextRequest) {
  const guard = await requireSession()
  if (guard.error) return guard.error
  const body = await request.json().catch(() => null)
  const parsed = requestStatusSchema.safeParse(body)
  if (!parsed.success) return fail('Invalid request status payload', 422)
  try {
    return ok(await updateRequestStatus(guard.session.sub, parsed.data.id, parsed.data.status))
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Request update failed', 400)
  }
}
