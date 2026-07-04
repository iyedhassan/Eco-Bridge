import { calculateListingImpact } from './impact'
import { AiWasteAnalysis, Listing, UserRole } from './types'
import { normalizeRole } from './roles'

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string')
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
    } catch {
      return value ? [value] : []
    }
  }
  return []
}

function statusToUi(status: string): Listing['availability'] {
  if (status === 'RESERVED') return 'reserved'
  if (status === 'SOLD') return 'sold'
  if (status === 'ARCHIVED') return 'archived'
  return 'available'
}

function urgencyToUi(urgency: string): Listing['urgency'] {
  if (urgency === 'HIGH') return 'high'
  if (urgency === 'LOW') return 'low'
  return 'medium'
}

export function uiStatusToDb(status: string | undefined) {
  if (status === 'reserved' || status === 'RESERVED') return 'RESERVED'
  if (status === 'sold' || status === 'SOLD') return 'SOLD'
  if (status === 'archived' || status === 'ARCHIVED') return 'ARCHIVED'
  return 'ACTIVE'
}

export function uiUrgencyToDb(urgency: string | undefined) {
  if (urgency === 'high' || urgency === 'HIGH') return 'HIGH'
  if (urgency === 'low' || urgency === 'LOW') return 'LOW'
  return 'MEDIUM'
}

export function serializeUser(user: any) {
  const profile = user.profile
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: normalizeRole(user.role) as UserRole,
    industry: profile?.sector ?? user.industry ?? '',
    location: profile?.location ?? user.location ?? '',
    createdAt: new Date(user.createdAt).toISOString(),
  }
}

export function serializeProfile(user: any) {
  const profile = user.profile
  return {
    id: profile?.id ?? user.id,
    userId: user.id,
    name: user.name,
    companyName: profile?.companyName ?? user.name,
    email: user.email,
    role: normalizeRole(user.role),
    sector: profile?.sector ?? '',
    industry: profile?.sector ?? '',
    location: profile?.location ?? '',
    phone: profile?.phone ?? '',
    description: profile?.description ?? '',
    offeredWasteTypes: asStringArray(profile?.offeredWasteTypes),
    neededMaterialTypes: asStringArray(profile?.neededMaterialTypes),
    memberSince: new Date(user.createdAt).toISOString(),
    createdAt: new Date(user.createdAt).toISOString(),
  }
}

export function serializeAiAnalysis(row: any): AiWasteAnalysis | undefined {
  if (!row) return undefined
  const detectedMaterial = row.detectedMaterial || row.materialType
  const category = row.category || row.categoryId
  const valorizationScore = row.valorizationScore || row.confidenceScore || 0
  const estimatedPriceRange = row.estimatedPriceRange || `${row.estimatedPriceMin ?? 0}–${row.estimatedPriceMax ?? 0} TND/kg`
  const recommendationText = row.recommendationText || row.recommendation
  const riskLevel = row.riskLevel || row.qualityRisk

  return {
    materialType: row.materialType || detectedMaterial,
    categoryId: row.categoryId || category,
    detectedMaterial,
    category,
    suggestedTitle: row.suggestedTitle,
    improvedDescription: row.improvedDescription,
    possibleUses: asStringArray(row.possibleUses),
    interestedSectors: asStringArray(row.interestedSectors),
    valorizationLevel: row.valorizationLevel,
    qualityRisk: row.qualityRisk || riskLevel,
    estimatedPriceRange,
    recommendation: row.recommendation || recommendationText,
    confidenceScore: row.confidenceScore || valorizationScore,
    source: row.source,
    qualityLevel: row.qualityLevel || row.valorizationLevel,
    riskLevel,
    valorizationScore,
    estimatedPriceMin: row.estimatedPriceMin ?? 0,
    estimatedPriceMax: row.estimatedPriceMax ?? 0,
    co2SavedKg: row.co2SavedKg ?? row.co2ReductionKg ?? 0,
    recommendationText,
  }
}

export function serializeListing(row: any): Listing {
  const base: Listing = {
    id: row.id,
    title: row.title,
    materialId: row.materialId,
    materialType: row.materialType,
    categoryId: row.categoryId,
    industry: row.industry,
    quantity: row.quantity,
    unit: row.unit,
    pricePerUnit: row.pricePerUnit,
    location: row.location,
    lat: row.lat,
    lng: row.lng,
    availability: statusToUi(row.availability),
    urgency: urgencyToUi(row.urgency),
    description: row.description,
    photos: asStringArray(row.photos),
    sellerId: row.sellerId,
    createdAt: new Date(row.createdAt).toISOString(),
  }

  const persistedImpact = {
    wasteReusedKg: Math.round(row.wasteReusedKg ?? 0),
    co2ReductionKg: Math.round(row.co2ReductionKg ?? 0),
    moneySavedTnd: Math.round(row.moneySavedTnd ?? 0),
    storageAvoidedKg: Math.round(row.storageAvoidedKg ?? 0),
  }

  return {
    ...base,
    seller: row.seller ? serializeUser(row.seller) : undefined,
    aiAnalysis: serializeAiAnalysis(row.aiAnalysis),
    impactEstimate: persistedImpact.wasteReusedKg > 0 ? persistedImpact : calculateListingImpact(base),
  }
}

export function serializeMatch(row: any) {
  const score = row.scorePayload ?? {
    materialSimilarity: row.materialScore ?? 0,
    industryCompatibility: row.sectorScore ?? 0,
    distanceScore: row.locationScore ?? 0,
    quantityScore: row.quantityScore ?? 0,
    priceScore: row.priceScore ?? 0,
    urgencyScore: 0,
    availabilityScore: 0,
    total: row.scoreTotal ?? row.score ?? 0,
    badge: row.badge,
    explanation: row.explanation,
    criteria: [],
    materialScore: row.materialScore ?? 0,
    sectorScore: row.sectorScore ?? 0,
    locationScore: row.locationScore ?? 0,
    globalScore: row.scoreTotal ?? row.score ?? 0,
  }

  return {
    id: row.id,
    listingId: row.listingId,
    projectId: row.materialNeedId,
    buyerId: row.buyerId,
    score,
    createdAt: new Date(row.createdAt).toISOString(),
    listing: row.listing ? serializeListing(row.listing) : undefined,
  }
}

export function serializeRequest(row: any) {
  return {
    id: row.id,
    listingId: row.listingId,
    buyerId: row.buyerId,
    sellerId: row.sellerId,
    message: row.message,
    quantityKg: row.quantityKg,
    proposedPrice: row.proposedPrice,
    status: row.status,
    createdAt: new Date(row.createdAt).toISOString(),
    listing: row.listing ? serializeListing(row.listing) : undefined,
  }
}

export function serializeMessage(row: any) {
  return {
    id: row.id,
    conversationId: row.conversationId,
    fromUserId: row.senderId,
    toUserId: row.receiverId,
    listingId: row.listingId,
    body: row.body,
    readAt: row.readAt ? new Date(row.readAt).toISOString() : null,
    createdAt: new Date(row.createdAt).toISOString(),
  }
}

export function serializeNotification(row: any) {
  return {
    id: row.id,
    userId: row.userId,
    type: row.type,
    title: row.title,
    message: row.message,
    read: row.read,
    createdAt: new Date(row.createdAt).toISOString(),
  }
}
