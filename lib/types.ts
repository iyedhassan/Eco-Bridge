export type UserRole = 'INDUSTRIAL_COMPANY' | 'STARTUP' | 'ENTREPRENEUR' | 'ADMIN'
export type LegacyUserRole = 'buyer' | 'seller' | 'investor' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  passwordHash: string
  role: UserRole
  industry: string
  location: string
  createdAt: string
}

export interface Profile {
  id: string
  userId: string
  companyName: string
  sector: string
  location: string
  phone?: string | null
  description?: string | null
  offeredWasteTypes: string[]
  neededMaterialTypes: string[]
  createdAt: string
}

export interface Category {
  id: string
  name: string
  description: string
}

export interface Material {
  id: string
  name: string
  categoryId: string
  unit: 'kg' | 'ton' | 'tonne' | 'Tonne' | 'L' | 'm3' | 'piece' | 'pièce' | string
}

export type ValorizationLevel = 'low' | 'medium' | 'high'

export interface AiWasteAnalysis {
  // Legacy fields used by the current UI
  materialType: string
  categoryId: string
  suggestedTitle: string
  improvedDescription: string
  possibleUses: string[]
  interestedSectors: string[]
  valorizationLevel: ValorizationLevel
  qualityRisk: string
  estimatedPriceRange: string
  recommendation: string
  confidenceScore: number
  source?: 'gemini' | 'fallback' | string

  // Professional Gemini fields persisted in Prisma
  detectedMaterial?: string
  category?: string
  qualityLevel?: string
  riskLevel?: string
  valorizationScore?: number
  estimatedPriceMin?: number
  estimatedPriceMax?: number
  co2SavedKg?: number
  recommendationText?: string
}


export interface EnvironmentalImpact {
  wasteReusedKg: number
  co2ReductionKg: number
  moneySavedTnd: number
  storageAvoidedKg: number
  coefficient?: number
  category?: string
  co2SavedKg?: number
  landfillAvoidedKg?: number
  estimatedSavings?: number
  explanation?: string
}


export interface Listing {
  id: string
  title: string
  materialId?: string | null
  materialType: string
  categoryId: string
  industry: string
  quantity: number
  unit: string
  pricePerUnit: number
  location: string
  lat: number
  lng: number
  availability: 'available' | 'reserved' | 'sold' | 'archived'
  urgency: 'low' | 'medium' | 'high'
  description: string
  photos: string[]
  sellerId: string
  seller?: Pick<User, 'id' | 'name' | 'email' | 'role' | 'industry' | 'location'>
  aiAnalysis?: AiWasteAnalysis
  impactEstimate?: EnvironmentalImpact
  createdAt: string
}

export interface Project {
  id: string
  ownerId: string
  name: string
  industry: string
  location: string
  needs: string[]
  quantityKg?: number
  maxPricePerUnit?: number
  budgetLevel: 'low' | 'medium' | 'high'
  createdAt: string
}

export interface MatchCriterion {
  label: string
  value: string
  score: number
}

export interface MatchScore {
  materialSimilarity: number
  industryCompatibility: number
  distanceScore: number
  quantityScore: number
  priceScore: number
  urgencyScore: number
  availabilityScore: number
  total: number
  badge: 'Match fort' | 'Match moyen' | 'Opportunité à vérifier'
  explanation: string
  criteria: MatchCriterion[]
  materialScore?: number
  sectorScore?: number
  locationScore?: number
  globalScore?: number
}


export interface Match {
  id: string
  listingId: string
  projectId?: string | null
  buyerId: string
  score: MatchScore
  createdAt: string
  listing?: Listing
}

export interface EcoRequest {
  id: string
  listingId: string
  buyerId: string
  sellerId: string
  message: string
  quantityKg?: number | null
  proposedPrice?: number | null
  status: 'PENDING' | 'ACCEPTED' | 'REFUSED' | 'NEGOTIATION' | 'COMPLETED'
  createdAt: string
  listing?: Listing
}

export interface Notification {
  id: string
  userId: string
  type: 'NEW_REQUEST' | 'REQUEST_ACCEPTED' | 'REQUEST_REFUSED' | 'NEW_MESSAGE' | 'NEW_MATCH' | 'LISTING_RESERVED' | 'LISTING_SOLD' | 'FAVORITE_ADDED' | 'TRANSACTION_COMPLETED' | string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export interface SavedSearch {
  id: string
  userId: string
  name: string
  filters: {
    materialType?: string
    industry?: string
    location?: string
    minPrice?: number
    maxPrice?: number
    minQuantity?: number
  }
  createdAt: string
}

export interface Message {
  id: string
  fromUserId: string
  toUserId: string
  listingId?: string | null
  conversationId?: string | null
  body: string
  readAt?: string | null
  createdAt: string
}

export interface Transaction {
  id: string
  requestId?: string | null
  listingId: string
  buyerId: string
  sellerId: string
  amountTnd: number
  commissionTnd: number
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
}

export interface Report {
  id: string
  listingId?: string
  userId: string
  reason: string
  status: 'open' | 'reviewed' | 'closed'
  createdAt: string
}

export interface AdvisorResult {
  projectSummary: string
  mainMaterial?: string
  detectedCity?: string
  detectedGoal?: string
  byproducts: string[]
  reuseTargets: string[]
  alternatives: string[]
  recommendedMaterials: string[]
  valorizationIdeas: string[]
  nextSteps: string[]
  contactMessage: string
  professionalMessage?: string
  nearbyListings: Listing[]
  matchedOpportunities: Array<{ listing: Listing; score: MatchScore }>
  ecoImpactEstimate: EnvironmentalImpact
}

export interface DashboardStats {
  totalListings: number
  activeListings: number
  receivedRequests: number
  sentRequests: number
  matchedOpportunities: number
  savedSearches: number
  alerts: number
  transactions: number
  totalCommissionTnd: number
  aiAnalyses?: number
  averageValorizationScore?: number
  unanalysedListings?: number
  ecoImpact: {
    wasteReusedKg: number
    moneySavedTnd: number
    co2ReductionKg: number
    storageAvoidedKg: number
  }
}
