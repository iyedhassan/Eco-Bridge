import { NextRequest } from 'next/server'
import { archiveListing, getListingById, updateListing } from '@/lib/backend'
import { fail, ok } from '@/lib/http'
import { requireSession } from '@/lib/session-guard'
import { listingSchema } from '@/lib/validation'

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const listing = await getListingById(id)
  if (!listing) return fail('Listing not found', 404)
  return ok(listing)
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await requireSession(['INDUSTRIAL_COMPANY', 'ADMIN'])
  if (guard.error) return guard.error

  const { id } = await context.params
  const existing = await getListingById(id)
  if (!existing) return fail('Listing not found', 404)
  if (guard.session.role !== 'ADMIN' && existing.sellerId !== guard.session.sub) return fail('Forbidden', 403)

  const body = await request.json().catch(() => null)
  const parsed = listingSchema.partial().safeParse(body)
  if (!parsed.success) return fail('Invalid listing payload', 422)

  const updated = await updateListing(id, parsed.data)
  if (!updated) return fail('Update failed', 400)
  return ok(updated)
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await requireSession(['INDUSTRIAL_COMPANY', 'ADMIN'])
  if (guard.error) return guard.error

  const { id } = await context.params
  const existing = await getListingById(id)
  if (!existing) return fail('Listing not found', 404)
  if (guard.session.role !== 'ADMIN' && existing.sellerId !== guard.session.sub) return fail('Forbidden', 403)

  await archiveListing(id)
  return ok({ archived: true })
}
