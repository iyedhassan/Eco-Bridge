import { prisma } from './prisma'
import { getCoordsForCity } from './geo'
import { calculateListingImpact } from './impact'
import { computeMatchScore, rankListingsForProject } from './matching'
import { AiWasteAnalysis, Listing, Project, UserRole } from './types'
import { normalizeRole } from './roles'
import {
  serializeListing,
  serializeMatch,
  serializeMessage,
  serializeNotification,
  serializeProfile,
  serializeRequest,
  serializeUser,
  uiStatusToDb,
  uiUrgencyToDb,
} from './serializers'

type ListingFilters = {
  materialType?: string
  industry?: string
  location?: string
  minPrice?: number
  maxPrice?: number
  minQuantity?: number
  availability?: string
}

type CreateListingInput = {
  title: string
  materialId?: string
  materialType: string
  categoryId: string
  industry: string
  quantity: number
  unit: string
  pricePerUnit: number
  location: string
  availability?: string
  urgency?: string
  description: string
  photos?: string[]
  aiAnalysis?: AiWasteAnalysis
}


function normalizeAnalysisForPrisma(analysis: AiWasteAnalysis, impact: { co2ReductionKg: number }, source?: string) {
  const valorizationScore = analysis.valorizationScore ?? analysis.confidenceScore ?? 80
  const detectedMaterial = analysis.detectedMaterial || analysis.materialType
  const category = analysis.category || analysis.categoryId
  const recommendationText = analysis.recommendationText || analysis.recommendation
  const riskLevel = analysis.riskLevel || analysis.qualityRisk
  const qualityLevel = analysis.qualityLevel || analysis.valorizationLevel

  return {
    detectedMaterial,
    category,
    qualityLevel,
    riskLevel,
    valorizationScore,
    estimatedPriceMin: analysis.estimatedPriceMin ?? 0,
    estimatedPriceMax: analysis.estimatedPriceMax ?? 0,
    co2SavedKg: analysis.co2SavedKg ?? impact.co2ReductionKg,
    recommendationText,
    materialType: analysis.materialType || detectedMaterial,
    categoryId: analysis.categoryId || category,
    possibleUses: analysis.possibleUses,
    interestedSectors: analysis.interestedSectors,
    valorizationLevel: analysis.valorizationLevel,
    qualityRisk: analysis.qualityRisk || riskLevel,
    estimatedPriceRange: analysis.estimatedPriceRange,
    suggestedTitle: analysis.suggestedTitle,
    improvedDescription: analysis.improvedDescription,
    recommendation: analysis.recommendation || recommendationText,
    confidenceScore: analysis.confidenceScore ?? valorizationScore,
    source: source || analysis.source || 'fallback',
    co2ReductionKg: impact.co2ReductionKg,
  }
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email: email.toLowerCase().trim() }, include: { profile: true } })
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id }, include: { profile: true } })
}

export async function createUser(input: {
  name: string
  email: string
  passwordHash: string
  role: UserRole | string
  industry: string
  location: string
  phone?: string
  description?: string
}) {
  const role = normalizeRole(input.role)
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase().trim(),
      passwordHash: input.passwordHash,
      role,
      profile: {
        create: {
          companyName: input.name,
          sector: input.industry,
          location: input.location,
          phone: input.phone || null,
          description: input.description || null,
          offeredWasteTypes: role === 'INDUSTRIAL_COMPANY' ? ['plastic', 'metal', 'wood'] : [],
          neededMaterialTypes: role !== 'INDUSTRIAL_COMPANY' ? ['plastic', 'cardboard', 'metal'] : [],
        },
      },
    },
    include: { profile: true },
  })
  return user
}

export async function getProfile(userId: string) {
  const user = await findUserById(userId)
  return user ? serializeProfile(user) : null
}

export async function updateProfile(userId: string, input: {
  name?: string
  companyName?: string
  sector?: string
  industry?: string
  location?: string
  phone?: string
  description?: string
  offeredWasteTypes?: string[]
  neededMaterialTypes?: string[]
}) {
  const sector = input.sector || input.industry
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.name ? { name: input.name } : {}),
      profile: {
        upsert: {
          create: {
            companyName: input.companyName || input.name || 'EcoBridge User',
            sector: sector || 'circular-economy',
            location: input.location || 'Sfax',
            phone: input.phone || null,
            description: input.description || null,
            offeredWasteTypes: input.offeredWasteTypes || [],
            neededMaterialTypes: input.neededMaterialTypes || [],
          },
          update: {
            ...(input.companyName ? { companyName: input.companyName } : {}),
            ...(sector ? { sector } : {}),
            ...(input.location ? { location: input.location } : {}),
            ...(input.phone !== undefined ? { phone: input.phone } : {}),
            ...(input.description !== undefined ? { description: input.description } : {}),
            ...(input.offeredWasteTypes ? { offeredWasteTypes: input.offeredWasteTypes } : {}),
            ...(input.neededMaterialTypes ? { neededMaterialTypes: input.neededMaterialTypes } : {}),
          },
        },
      },
    },
    include: { profile: true },
  })
  return serializeProfile(user)
}

function listingWhere(filters: ListingFilters) {
  const where: any = {}
  if (filters.materialType) {
    where.OR = [
      { materialType: { contains: filters.materialType } },
      { categoryId: { contains: filters.materialType } },
      { title: { contains: filters.materialType } },
    ]
  }
  if (filters.industry) where.industry = { contains: filters.industry }
  if (filters.location) where.location = { contains: filters.location }
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.pricePerUnit = {
      ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
    }
  }
  if (filters.minQuantity !== undefined) where.quantity = { gte: filters.minQuantity }
  if (filters.availability) where.availability = uiStatusToDb(filters.availability)
  else where.availability = { not: 'ARCHIVED' }
  return where
}

export async function getListings(filters: ListingFilters = {}) {
  const listings = await prisma.listing.findMany({
    where: listingWhere(filters),
    include: { aiAnalysis: true, seller: { include: { profile: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return listings.map(serializeListing)
}

export async function getListingById(id: string) {
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { aiAnalysis: true, seller: { include: { profile: true } } },
  })
  return listing ? serializeListing(listing) : null
}

export async function createListing(input: CreateListingInput, sellerId: string) {
  const coords = getCoordsForCity(input.location)
  const baseForImpact = {
    title: input.title,
    materialType: input.materialType,
    categoryId: input.categoryId,
    description: input.description,
    quantity: input.quantity,
    unit: input.unit,
    pricePerUnit: input.pricePerUnit,
  }
  const impact = calculateListingImpact(baseForImpact)

  const listing = await prisma.listing.create({
    data: {
      title: input.title,
      description: input.description,
      materialId: input.materialId || null,
      materialType: input.materialType,
      categoryId: input.categoryId,
      industry: input.industry,
      quantity: input.quantity,
      quantityKg: impact.wasteReusedKg,
      unit: input.unit,
      pricePerUnit: input.pricePerUnit,
      location: input.location,
      lat: coords.lat,
      lng: coords.lng,
      availability: uiStatusToDb(input.availability),
      urgency: uiUrgencyToDb(input.urgency),
      photos: input.photos?.length ? input.photos : ['https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=1200&auto=format&fit=crop'],
      wasteReusedKg: impact.wasteReusedKg,
      co2ReductionKg: impact.co2ReductionKg,
      moneySavedTnd: impact.moneySavedTnd,
      storageAvoidedKg: impact.storageAvoidedKg,
      sellerId,
      ...(input.aiAnalysis ? {
        aiAnalysis: {
          create: normalizeAnalysisForPrisma(input.aiAnalysis, impact),
        },
      } : {}),
    },
    include: { aiAnalysis: true, seller: { include: { profile: true } } },
  })

  await notifyPotentialBuyers(listing.id, input.categoryId, input.materialType)
  return serializeListing(listing)
}

export async function updateListing(id: string, input: Partial<CreateListingInput>) {
  const existing = await prisma.listing.findUnique({ where: { id } })
  if (!existing) return null

  const next = {
    title: input.title ?? existing.title,
    materialType: input.materialType ?? existing.materialType,
    categoryId: input.categoryId ?? existing.categoryId,
    description: input.description ?? existing.description,
    quantity: input.quantity ?? existing.quantity,
    unit: input.unit ?? existing.unit,
    pricePerUnit: input.pricePerUnit ?? existing.pricePerUnit,
  }
  const impact = calculateListingImpact(next)
  const coords = input.location ? getCoordsForCity(input.location) : { lat: existing.lat, lng: existing.lng }

  const listing = await prisma.listing.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.materialId !== undefined ? { materialId: input.materialId || null } : {}),
      ...(input.materialType !== undefined ? { materialType: input.materialType } : {}),
      ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
      ...(input.industry !== undefined ? { industry: input.industry } : {}),
      ...(input.quantity !== undefined ? { quantity: input.quantity } : {}),
      quantityKg: impact.wasteReusedKg,
      ...(input.unit !== undefined ? { unit: input.unit } : {}),
      ...(input.pricePerUnit !== undefined ? { pricePerUnit: input.pricePerUnit } : {}),
      ...(input.location !== undefined ? { location: input.location, lat: coords.lat, lng: coords.lng } : {}),
      ...(input.availability !== undefined ? { availability: uiStatusToDb(input.availability) } : {}),
      ...(input.urgency !== undefined ? { urgency: uiUrgencyToDb(input.urgency) } : {}),
      ...(input.photos !== undefined ? { photos: input.photos } : {}),
      wasteReusedKg: impact.wasteReusedKg,
      co2ReductionKg: impact.co2ReductionKg,
      moneySavedTnd: impact.moneySavedTnd,
      storageAvoidedKg: impact.storageAvoidedKg,
      ...(input.aiAnalysis ? {
        aiAnalysis: {
          upsert: {
            create: normalizeAnalysisForPrisma(input.aiAnalysis, impact),
            update: normalizeAnalysisForPrisma(input.aiAnalysis, impact),
          },
        },
      } : {}),
    },
    include: { aiAnalysis: true, seller: { include: { profile: true } } },
  })
  return serializeListing(listing)
}

export async function archiveListing(id: string) {
  const listing = await prisma.listing.update({ where: { id }, data: { availability: 'ARCHIVED' } })
  return Boolean(listing)
}

export async function deleteListing(id: string) {
  await prisma.listing.delete({ where: { id } })
  return true
}

export async function saveAnalysisForListing(listingId: string, analysis: AiWasteAnalysis, source: string) {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } })
  if (!listing) return null
  const impact = calculateListingImpact(listing as any)
  const updated = await prisma.listing.update({
    where: { id: listingId },
    data: {
      title: analysis.suggestedTitle || listing.title,
      description: analysis.improvedDescription || listing.description,
      materialType: analysis.materialType || listing.materialType,
      categoryId: analysis.categoryId || listing.categoryId,
      wasteReusedKg: impact.wasteReusedKg,
      co2ReductionKg: impact.co2ReductionKg,
      moneySavedTnd: impact.moneySavedTnd,
      storageAvoidedKg: impact.storageAvoidedKg,
      aiAnalysis: {
        upsert: {
          create: normalizeAnalysisForPrisma(analysis, impact, source),
          update: normalizeAnalysisForPrisma(analysis, impact, source),
        },
      },
    },
    include: { aiAnalysis: true, seller: { include: { profile: true } } },
  })
  return serializeListing(updated)
}

export async function createMaterialNeedAndMatches(userId: string, input: {
  name: string
  industry: string
  location: string
  needs: string[]
  budgetLevel: 'low' | 'medium' | 'high'
  quantityKg?: number
  maxPricePerUnit?: number
}) {
  const need = await prisma.materialNeed.create({
    data: {
      ownerId: userId,
      name: input.name,
      industry: input.industry,
      location: input.location,
      needs: input.needs,
      budgetLevel: input.budgetLevel.toUpperCase() as any,
      quantityKg: input.quantityKg || 0,
      maxPricePerUnit: input.maxPricePerUnit || null,
    },
  })

  const listings = await getListings({ availability: 'available' })
  const project: Project = {
    id: need.id,
    ownerId: userId,
    name: need.name,
    industry: need.industry,
    location: need.location,
    needs: Array.isArray(need.needs) ? need.needs as string[] : [],
    quantityKg: need.quantityKg,
    maxPricePerUnit: need.maxPricePerUnit ?? undefined,
    budgetLevel: input.budgetLevel,
    createdAt: need.createdAt.toISOString(),
  }
  const ranked = rankListingsForProject(listings, project).slice(0, 8)

  await prisma.match.deleteMany({ where: { materialNeedId: need.id } })
  const saved = []
  for (const item of ranked) {
    const row = await prisma.match.create({
      data: {
        listingId: item.listing.id,
        materialNeedId: need.id,
        buyerId: userId,
        score: item.score.total,
        materialScore: item.score.materialSimilarity,
        sectorScore: item.score.industryCompatibility,
        locationScore: item.score.distanceScore,
        quantityScore: item.score.quantityScore,
        priceScore: item.score.priceScore,
        status: 'ACTIVE',
        scoreTotal: item.score.total,
        badge: item.score.badge,
        explanation: item.score.explanation,
        scorePayload: item.score as any,
      },
      include: { listing: { include: { aiAnalysis: true, seller: { include: { profile: true } } } } },
    })
    saved.push(serializeMatch(row))
    await prisma.notification.create({
      data: {
        userId,
        type: 'NEW_MATCH',
        title: `${item.score.badge} détecté`,
        message: `${item.listing.title} correspond à ${item.score.total}/100 à votre besoin.`,
      },
    })
  }

  return { project, matches: saved }
}

export async function getMatchesForUser(userId: string) {
  const rows = await prisma.match.findMany({
    where: { buyerId: userId },
    include: { listing: { include: { aiAnalysis: true, seller: { include: { profile: true } } } } },
    orderBy: [{ scoreTotal: 'desc' }, { createdAt: 'desc' }],
  })
  return rows.map(serializeMatch)
}

export async function createRequest(userId: string, input: { listingId: string; message: string; quantityKg?: number; proposedPrice?: number }) {
  const listing = await prisma.listing.findUnique({ where: { id: input.listingId } })
  if (!listing) throw new Error('Listing not found')
  if (listing.sellerId === userId) throw new Error('Cannot request your own listing')

  const request = await prisma.request.create({
    data: {
      listingId: listing.id,
      buyerId: userId,
      sellerId: listing.sellerId,
      message: input.message,
      quantityKg: input.quantityKg || null,
      proposedPrice: input.proposedPrice || null,
      conversation: {
        create: {
          listingId: listing.id,
          buyerId: userId,
          sellerId: listing.sellerId,
          messages: {
            create: {
              senderId: userId,
              receiverId: listing.sellerId,
              listingId: listing.id,
              body: input.message,
            },
          },
        },
      },
    },
    include: { listing: { include: { aiAnalysis: true, seller: { include: { profile: true } } } } },
  })

  await prisma.notification.create({
    data: {
      userId: listing.sellerId,
      type: 'NEW_REQUEST',
      title: 'Nouvelle demande reçue',
      message: `Un acheteur est intéressé par: ${listing.title}`,
    },
  })

  return serializeRequest(request)
}

export async function getRequests(userId: string) {
  const rows = await prisma.request.findMany({
    where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    include: { listing: { include: { aiAnalysis: true, seller: { include: { profile: true } } } } },
    orderBy: { createdAt: 'desc' },
  })
  return rows.map(serializeRequest)
}

export async function updateRequestStatus(userId: string, requestId: string, status: 'PENDING' | 'ACCEPTED' | 'REFUSED' | 'NEGOTIATION' | 'COMPLETED') {
  const existing = await prisma.request.findUnique({ where: { id: requestId }, include: { listing: true } })
  if (!existing) throw new Error('Request not found')
  if (existing.sellerId !== userId && existing.buyerId !== userId) throw new Error('Forbidden')

  const updated = await prisma.request.update({
    where: { id: requestId },
    data: {
      status,
      ...(status === 'ACCEPTED' ? { listing: { update: { availability: 'RESERVED' } } } : {}),
      ...(status === 'COMPLETED' ? { listing: { update: { availability: 'SOLD' } } } : {}),
    },
    include: { listing: { include: { aiAnalysis: true, seller: { include: { profile: true } } } } },
  })

  const notifyUser = updated.buyerId === userId ? updated.sellerId : updated.buyerId
  await prisma.notification.create({
    data: {
      userId: notifyUser,
      type: status === 'REFUSED' ? 'REQUEST_REFUSED' : 'REQUEST_ACCEPTED',
      title: `Demande ${status.toLowerCase()}`,
      message: `La demande liée à ${updated.listing.title} est maintenant ${status}.`,
    },
  })

  if (status === 'COMPLETED') {
    await createTransactionFromRequest(updated.id)
  }

  return serializeRequest(updated)
}

export async function getMessages(userId: string) {
  const rows = await prisma.message.findMany({
    where: { OR: [{ senderId: userId }, { receiverId: userId }] },
    orderBy: { createdAt: 'desc' },
  })
  return rows.map(serializeMessage)
}

export async function sendMessage(userId: string, input: { receiverId: string; body: string; listingId?: string; conversationId?: string }) {
  const message = await prisma.message.create({
    data: {
      senderId: userId,
      receiverId: input.receiverId,
      body: input.body,
      listingId: input.listingId || null,
      conversationId: input.conversationId || null,
    },
  })
  await prisma.notification.create({
    data: {
      userId: input.receiverId,
      type: 'NEW_MESSAGE',
      title: 'Nouveau message',
      message: input.body.slice(0, 120),
    },
  })
  return serializeMessage(message)
}

export async function toggleFavorite(userId: string, listingId: string) {
  const existing = await prisma.favorite.findUnique({ where: { userId_listingId: { userId, listingId } } })
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } })
    return { favorite: false }
  }
  const favorite = await prisma.favorite.create({ data: { userId, listingId } })
  const listing = await prisma.listing.findUnique({ where: { id: listingId } })
  if (listing) {
    await prisma.notification.create({
      data: {
        userId: listing.sellerId,
        type: 'FAVORITE_ADDED',
        title: 'Annonce ajoutée aux favoris',
        message: `Un utilisateur a ajouté ${listing.title} aux favoris.`,
      },
    })
  }
  return { favorite: true, id: favorite.id }
}

export async function getFavorites(userId: string) {
  const rows = await prisma.favorite.findMany({
    where: { userId },
    include: { listing: { include: { aiAnalysis: true, seller: { include: { profile: true } } } } },
    orderBy: { createdAt: 'desc' },
  })
  return rows.map((row: any) => serializeListing(row.listing))
}

export async function createTransactionFromRequest(requestId: string) {
  const request = await prisma.request.findUnique({ where: { id: requestId }, include: { listing: true, transaction: true } })
  if (!request) throw new Error('Request not found')
  if (request.transaction) return request.transaction
  const quantity = request.quantityKg || request.listing.quantity
  const amountTnd = request.proposedPrice || quantity * request.listing.pricePerUnit
  const commissionTnd = Math.round(amountTnd * 0.05 * 1000) / 1000
  const transaction = await prisma.transaction.create({
    data: {
      requestId: request.id,
      listingId: request.listingId,
      buyerId: request.buyerId,
      sellerId: request.sellerId,
      amountTnd,
      commissionTnd,
      status: 'COMPLETED',
    },
  })
  await prisma.notification.create({
    data: {
      userId: request.sellerId,
      type: 'TRANSACTION_COMPLETED',
      title: 'Transaction finalisée',
      message: `Transaction de ${amountTnd} TND. Commission EcoBridge: ${commissionTnd} TND.`,
    },
  })
  return transaction
}

export async function getTransactions(userId: string, role: UserRole) {
  return prisma.transaction.findMany({
    where: role === 'ADMIN' ? {} : { OR: [{ buyerId: userId }, { sellerId: userId }] },
    include: { listing: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getNotifications(userId: string) {
  const rows = await prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })
  return rows.map(serializeNotification)
}

export async function markNotificationRead(userId: string, id: string) {
  const existing = await prisma.notification.findUnique({ where: { id } })
  if (!existing) throw new Error('Notification not found')
  if (existing.userId !== userId) throw new Error('Forbidden')
  const updated = await prisma.notification.update({ where: { id }, data: { read: true } })
  return serializeNotification(updated)
}

export async function getDashboardStats(userId: string, role: UserRole) {
  const listingWhere = role === 'ADMIN' ? {} : role === 'INDUSTRIAL_COMPANY' ? { sellerId: userId } : {}
  const activeWhere = { ...listingWhere, availability: { not: 'ARCHIVED' as const } }
  const [listings, matches, favorites, alerts, receivedRequests, sentRequests, transactions, aiAnalyses] = await Promise.all([
    prisma.listing.findMany({ where: activeWhere }),
    prisma.match.count({ where: role === 'ADMIN' ? {} : { buyerId: userId } }),
    prisma.favorite.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, read: false } }),
    prisma.request.count({ where: { sellerId: userId } }),
    prisma.request.count({ where: { buyerId: userId } }),
    prisma.transaction.findMany({ where: role === 'ADMIN' ? {} : { OR: [{ buyerId: userId }, { sellerId: userId }] } }),
    prisma.aIAnalysis.findMany({ where: role === 'ADMIN' ? {} : { listing: { is: listingWhere } }, include: { listing: true } }),
  ])

  return {
    totalListings: listings.length,
    activeListings: listings.filter((listing: any) => listing.availability === 'ACTIVE').length,
    receivedRequests,
    sentRequests,
    matchedOpportunities: matches,
    savedSearches: favorites,
    alerts,
    transactions: transactions.length,
    totalCommissionTnd: Math.round(transactions.reduce((sum: number, tx: any) => sum + tx.commissionTnd, 0)),
    aiAnalyses: aiAnalyses.length,
    averageValorizationScore: aiAnalyses.length ? Math.round(aiAnalyses.reduce((sum: number, item: any) => sum + (item.valorizationScore || item.confidenceScore || 0), 0) / aiAnalyses.length) : 0,
    unanalysedListings: Math.max(0, listings.length - aiAnalyses.length),
    ecoImpact: {
      wasteReusedKg: Math.round(listings.reduce((sum: number, item: any) => sum + item.wasteReusedKg, 0)),
      moneySavedTnd: Math.round(listings.reduce((sum: number, item: any) => sum + item.moneySavedTnd, 0)),
      co2ReductionKg: Math.round(listings.reduce((sum: number, item: any) => sum + item.co2ReductionKg, 0)),
      storageAvoidedKg: Math.round(listings.reduce((sum: number, item: any) => sum + item.storageAvoidedKg, 0)),
    },
  }
}

export async function getAdminSummary() {
  const [users, listings, requests, transactions, notifications, categories] = await Promise.all([
    prisma.user.findMany({ include: { profile: true }, orderBy: { createdAt: 'desc' } }),
    prisma.listing.findMany({ include: { aiAnalysis: true, seller: { include: { profile: true } } }, orderBy: { createdAt: 'desc' } }),
    prisma.request.findMany({ include: { listing: { include: { aiAnalysis: true, seller: { include: { profile: true } } } } }, orderBy: { createdAt: 'desc' } }),
    prisma.transaction.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
    prisma.category.findMany(),
  ])

  return {
    users: users.map(serializeUser),
    listings: listings.map(serializeListing),
    requests: requests.map(serializeRequest),
    transactions: transactions.map((tx: any) => ({
      id: tx.id,
      requestId: tx.requestId,
      listingId: tx.listingId,
      buyerId: tx.buyerId,
      sellerId: tx.sellerId,
      amountTnd: tx.amountTnd,
      commissionTnd: tx.commissionTnd,
      status: tx.status,
      createdAt: tx.createdAt.toISOString(),
    })),
    notifications: notifications.map(serializeNotification),
    categories,
  }
}

export async function notifyPotentialBuyers(listingId: string, categoryId: string, materialType: string) {
  const buyers = await prisma.user.findMany({
    where: { role: { in: ['STARTUP', 'ENTREPRENEUR'] } },
    include: { profile: true },
  })
  const listing = await prisma.listing.findUnique({ where: { id: listingId } })
  if (!listing) return
  const text = `${categoryId} ${materialType}`.toLowerCase()
  for (const buyer of buyers) {
    const needs = Array.isArray(buyer.profile?.neededMaterialTypes) ? buyer.profile?.neededMaterialTypes as string[] : []
    const relevant = needs.length === 0 || needs.some((need) => text.includes(need.toLowerCase()) || need.toLowerCase().includes(categoryId.toLowerCase()))
    if (relevant) {
      await prisma.notification.create({
        data: {
          userId: buyer.id,
          type: 'NEW_MATCH',
          title: 'Nouvelle opportunité de matière',
          message: `${listing.title} peut correspondre à vos besoins en ${materialType}.`,
        },
      })
    }
  }
}

export async function buildAdvisorContext(userId: string, description?: string, industry?: string, location?: string) {
  const user = await findUserById(userId)
  const effectiveIndustry = industry || user?.profile?.sector || 'packaging'
  const effectiveLocation = location || user?.profile?.location || 'Sfax'
  const listings = await getListings({ location: effectiveLocation, availability: 'available' })
  const effectiveListings = listings.length ? listings : await getListings({ availability: 'available' })
  const project: Project = {
    id: 'advisor-project',
    ownerId: userId,
    name: description || 'Besoin EcoBridge',
    industry: effectiveIndustry,
    location: effectiveLocation,
    needs: [description || '', effectiveIndustry].filter(Boolean),
    budgetLevel: 'medium',
    createdAt: new Date().toISOString(),
  }
  return { user, effectiveListings, project }
}
