import { z } from 'zod'
import { normalizeRole } from './roles'

export const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.string().default('STARTUP').transform(normalizeRole),
  industry: z.string().min(2),
  location: z.string().min(2),
  phone: z.string().optional(),
  description: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const stringArray = z.array(z.string().min(1)).default([])

export const profileSchema = z.object({
  name: z.string().min(2).optional(),
  companyName: z.string().min(2).optional(),
  sector: z.string().min(2).optional(),
  industry: z.string().min(2).optional(),
  location: z.string().min(2).optional(),
  phone: z.string().optional(),
  description: z.string().optional(),
  offeredWasteTypes: stringArray.optional(),
  neededMaterialTypes: stringArray.optional(),
})

export const aiAnalysisSchema = z.object({
  materialType: z.string().min(2),
  categoryId: z.string().min(2),
  suggestedTitle: z.string().min(2),
  improvedDescription: z.string().min(4),
  possibleUses: z.array(z.string()).default([]),
  interestedSectors: z.array(z.string()).default([]),
  valorizationLevel: z.enum(['low', 'medium', 'high']).default('medium'),
  qualityRisk: z.string().default('À vérifier'),
  estimatedPriceRange: z.string().default('À négocier'),
  recommendation: z.string().default('Ajouter photos, fiche technique et conditions de stockage.'),
  confidenceScore: z.number().min(0).max(100).default(80),
  source: z.string().optional(),
  detectedMaterial: z.string().optional(),
  category: z.string().optional(),
  qualityLevel: z.string().optional(),
  riskLevel: z.string().optional(),
  valorizationScore: z.number().min(0).max(100).optional(),
  estimatedPriceMin: z.number().nonnegative().optional(),
  estimatedPriceMax: z.number().nonnegative().optional(),
  co2SavedKg: z.number().nonnegative().optional(),
  recommendationText: z.string().optional(),
})

export const listingSchema = z.object({
  title: z.string().min(3),
  materialId: z.string().optional(),
  materialType: z.string().min(2),
  categoryId: z.string().min(2),
  industry: z.string().min(2),
  quantity: z.coerce.number().positive(),
  unit: z.string().min(1),
  pricePerUnit: z.coerce.number().nonnegative(),
  location: z.string().min(2),
  availability: z.enum(['available', 'reserved', 'sold', 'archived', 'ACTIVE', 'RESERVED', 'SOLD', 'ARCHIVED']).default('available'),
  urgency: z.enum(['low', 'medium', 'high', 'LOW', 'MEDIUM', 'HIGH']).default('medium'),
  description: z.string().min(10),
  photos: z.array(z.string()).default([]),
  aiAnalysis: aiAnalysisSchema.optional(),
})

export const analyzeSchema = z.object({
  listingId: z.string().optional(),
  title: z.string().default(''),
  materialType: z.string().min(2),
  categoryId: z.string().min(2).default('plastic'),
  industry: z.string().min(2).default('packaging'),
  quantity: z.coerce.number().positive(),
  unit: z.string().min(1),
  pricePerUnit: z.coerce.number().nonnegative(),
  location: z.string().min(2),
  description: z.string().min(4),
})

export const materialNeedSchema = z.object({
  name: z.string().min(3),
  industry: z.string().min(2),
  location: z.string().min(2),
  needs: z.array(z.string().min(2)).min(1),
  budgetLevel: z.enum(['low', 'medium', 'high']).default('medium'),
  quantityKg: z.coerce.number().positive().optional(),
  maxPricePerUnit: z.coerce.number().nonnegative().optional(),
})

export const requestSchema = z.object({
  listingId: z.string().min(1),
  message: z.string().min(4),
  quantityKg: z.coerce.number().positive().optional(),
  proposedPrice: z.coerce.number().nonnegative().optional(),
})

export const requestStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['PENDING', 'ACCEPTED', 'REFUSED', 'NEGOTIATION', 'COMPLETED']),
})

export const messageSchema = z.object({
  receiverId: z.string().min(1),
  body: z.string().min(1),
  listingId: z.string().optional(),
  conversationId: z.string().optional(),
})

export const favoriteSchema = z.object({
  listingId: z.string().min(1),
})

export const advisorSchema = z.object({
  description: z.string().min(6).optional(),
  projectType: z.string().min(3).optional(),
  industry: z.string().min(2).optional(),
  location: z.string().min(2).optional(),
}).refine((value) => Boolean(value.description || value.projectType), {
  message: 'Need description or projectType',
  path: ['description'],
})
