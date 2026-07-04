import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fail } from '@/lib/http'
import { requireSession } from '@/lib/session-guard'
import { analyzeWasteWithAI } from '@/lib/waste-ai'
import { saveAnalysisForListing } from '@/lib/backend'
import { analyzeSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)

  if (body?.listingId) {
    const guard = await requireSession()
    if (guard.error) return guard.error

    const listing = await prisma.listing.findUnique({ where: { id: String(body.listingId) } })
    if (!listing) return fail('Annonce introuvable', 404)
    if (guard.session.role !== 'ADMIN' && listing.sellerId !== guard.session.sub) {
      return fail('Seul le propriétaire ou un administrateur peut relancer l’analyse IA.', 403)
    }

    const result = await analyzeWasteWithAI({
      title: listing.title,
      description: listing.description,
      materialType: listing.materialType,
      categoryId: listing.categoryId,
      industry: listing.industry,
      quantity: listing.quantity,
      unit: listing.unit,
      pricePerUnit: listing.pricePerUnit,
      location: listing.location,
    })

    const updatedListing = await saveAnalysisForListing(listing.id, result.analysis, result.source)
    return NextResponse.json({
      success: true,
      ok: true,
      analysis: result.analysis,
      data: { ...result, analysis: result.analysis, listing: updatedListing },
    })
  }

  const parsed = analyzeSchema.safeParse(body)
  if (!parsed.success) return fail('Invalid waste analysis payload', 422)
  const result = await analyzeWasteWithAI(parsed.data)
  return NextResponse.json({
    success: true,
    ok: true,
    analysis: result.analysis,
    data: result,
  })
}
