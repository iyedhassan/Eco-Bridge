import { NextRequest } from 'next/server'
import { fail, ok } from '@/lib/http'
import { requireSession } from '@/lib/session-guard'
import { analyzeWasteWithAi } from '@/lib/waste-ai'
import { analyzeSchema } from '@/lib/validation'
import { saveAnalysisForListing } from '@/lib/backend'

export async function POST(request: NextRequest) {
  const guard = await requireSession()
  if (guard.error) return guard.error

  const body = await request.json().catch(() => null)
  const parsed = analyzeSchema.safeParse(body)
  if (!parsed.success) return fail('Invalid waste analysis payload', 422)

  const result = await analyzeWasteWithAi(parsed.data)
  if (parsed.data.listingId) {
    const updatedListing = await saveAnalysisForListing(parsed.data.listingId, result.analysis, result.source)
    return ok({ ...result, listing: updatedListing })
  }
  return ok(result)
}
