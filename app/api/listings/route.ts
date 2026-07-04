import { NextRequest } from 'next/server'
import { createListing, getListings } from '@/lib/backend'
import { fail, ok } from '@/lib/http'
import { requireSession } from '@/lib/session-guard'
import { listingSchema } from '@/lib/validation'
import { canPublishListing } from '@/lib/roles'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const listings = await getListings({
    materialType: searchParams.get('materialType') || undefined,
    industry: searchParams.get('industry') || undefined,
    location: searchParams.get('location') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    minQuantity: searchParams.get('minQuantity') ? Number(searchParams.get('minQuantity')) : undefined,
    availability: searchParams.get('availability') || undefined,
  })
  return ok(listings)
}

export async function POST(request: NextRequest) {
  const guard = await requireSession()
  if (guard.error) return guard.error
  if (!canPublishListing(guard.session.role)) {
    return fail('Only industrial companies can publish waste listings', 403)
  }

  const body = await request.json().catch(() => null)
  const parsed = listingSchema.safeParse(body)
  if (!parsed.success) return fail('Invalid listing payload', 422)

  const listing = await createListing(parsed.data, guard.session.sub)
  return ok(listing, { status: 201 })
}
