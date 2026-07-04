import { calculateListingImpact, inferImpactCategory } from './impact'
import { AiWasteAnalysis, Listing, ValorizationLevel } from './types'
import { generateGeminiText, isGeminiConfigured } from './gemini'

type WasteAnalysisInput = Partial<
  Pick<
    Listing,
    'title' | 'materialType' | 'categoryId' | 'industry' | 'quantity' | 'unit' | 'pricePerUnit' | 'location' | 'description'
  >
> & {
  category?: string
  quantityKg?: number
  city?: string
  estimatedPrice?: number
}

type MaterialProfile = {
  label: string
  categoryId: string
  possibleUses: string[]
  interestedSectors: string[]
  valorizationLevel: ValorizationLevel
  qualityLevel: string
  riskLevel: string
  riskText: string
  recommendation: string
  score: number
  priceFactorMin: number
  priceFactorMax: number
}

const materialProfiles: Record<string, MaterialProfile> = {
  plastic: {
    label: 'Plastique PET / PEHD',
    categoryId: 'plastic',
    possibleUses: ['Granulés recyclés', 'Emballages recyclés', 'Fibres polyester', 'Pièces moulées secondaires'],
    interestedSectors: ['Packaging', 'Plasturgie', 'Recyclage plastique', 'Textile technique'],
    valorizationLevel: 'high',
    qualityLevel: 'Bonne si le lot est trié et propre',
    riskLevel: 'Moyen',
    riskText: 'Vérifier le tri par polymère, l’absence de PVC, l’humidité et les contaminations alimentaires.',
    recommendation: 'Trier PET, PEHD et films séparément, compacter le lot et ajouter des photos pour augmenter la valeur.',
    score: 88,
    priceFactorMin: 0.75,
    priceFactorMax: 1.35,
  },
  metal: {
    label: 'Métal / aluminium / acier',
    categoryId: 'metal',
    possibleUses: ['Fonderie', 'Refonte', 'Pièces métalliques secondaires', 'Revente à recycleur métal'],
    interestedSectors: ['Fonderie', 'Construction', 'Usinage', 'Recyclage métal'],
    valorizationLevel: 'high',
    qualityLevel: 'Très bonne si les métaux sont séparés',
    riskLevel: 'Faible à moyen',
    riskText: 'Contrôler la présence d’huiles, peintures, plastiques ou métaux mélangés.',
    recommendation: 'Séparer aluminium, acier, fer et cuivre pour améliorer le prix et faciliter la transaction.',
    score: 91,
    priceFactorMin: 0.85,
    priceFactorMax: 1.45,
  },
  wood: {
    label: 'Bois / palettes',
    categoryId: 'wood',
    possibleUses: ['Mobilier recyclé', 'Panneaux compressés', 'Biomasse', 'Réemploi logistique'],
    interestedSectors: ['Ameublement', 'Construction légère', 'Agriculture', 'Biomasse'],
    valorizationLevel: 'medium',
    qualityLevel: 'Moyenne à bonne selon l’état',
    riskLevel: 'Moyen',
    riskText: 'Vérifier l’humidité, le traitement chimique, les clous et l’état mécanique.',
    recommendation: 'Séparer bois propre et bois traité, indiquer les dimensions et l’état des palettes.',
    score: 74,
    priceFactorMin: 0.55,
    priceFactorMax: 1.15,
  },
  textile: {
    label: 'Textile industriel',
    categoryId: 'textile',
    possibleUses: ['Isolation thermique', 'Rembourrage', 'Chiffons industriels', 'Fibres recyclées'],
    interestedSectors: ['Textile', 'Automobile', 'Isolation', 'Ameublement'],
    valorizationLevel: 'medium',
    qualityLevel: 'Moyenne si les matières sont mélangées',
    riskLevel: 'Moyen',
    riskText: 'Vérifier la composition coton/polyester, la propreté, les zips, boutons et couleurs.',
    recommendation: 'Trier par composition et couleur pour rendre le lot plus attractif.',
    score: 72,
    priceFactorMin: 0.45,
    priceFactorMax: 1.05,
  },
  paper: {
    label: 'Papier / carton',
    categoryId: 'paper',
    possibleUses: ['Pâte recyclée', 'Carton ondulé', 'Calage emballage', 'Papier recyclé'],
    interestedSectors: ['Packaging', 'Papeterie', 'Logistique', 'Imprimerie'],
    valorizationLevel: 'medium',
    qualityLevel: 'Bonne si le lot est sec',
    riskLevel: 'Faible à moyen',
    riskText: 'Éviter l’humidité, les films plastiques, cartons souillés ou mélanges non triés.',
    recommendation: 'Compacter le carton, garantir un lot sec et préciser la fréquence de disponibilité.',
    score: 78,
    priceFactorMin: 0.55,
    priceFactorMax: 1.2,
  },
  organic: {
    label: 'Organique non dangereux',
    categoryId: 'organic',
    possibleUses: ['Compostage', 'Biomasse', 'Substrat agricole', 'Valorisation énergétique contrôlée'],
    interestedSectors: ['Agriculture', 'Énergie biomasse', 'Agro-industrie', 'Compostage'],
    valorizationLevel: 'medium',
    qualityLevel: 'Variable selon l’humidité et la stabilité',
    riskLevel: 'Moyen à élevé',
    riskText: 'Vérifier odeurs, humidité, origine, stockage et conformité sanitaire.',
    recommendation: 'Indiquer l’origine, la saisonnalité, l’humidité et utiliser un stockage fermé.',
    score: 68,
    priceFactorMin: 0.35,
    priceFactorMax: 0.9,
  },
  oil: {
    label: 'Huile usagée non dangereuse',
    categoryId: 'oil',
    possibleUses: ['Biodiesel', 'Savon industriel', 'Valorisation énergétique contrôlée', 'Collecte spécialisée'],
    interestedSectors: ['Biodiesel', 'Chimie', 'Énergie', 'Collecteurs agréés'],
    valorizationLevel: 'high',
    qualityLevel: 'Bonne si stockée en fûts propres',
    riskLevel: 'Élevé',
    riskText: 'La collecte doit respecter les règles de stockage, traçabilité et sécurité.',
    recommendation: 'Stocker en fûts fermés, éviter les mélanges et préciser l’origine exacte.',
    score: 82,
    priceFactorMin: 0.6,
    priceFactorMax: 1.25,
  },
  default: {
    label: 'Matière industrielle secondaire',
    categoryId: 'default',
    possibleUses: ['Réemploi industriel', 'Recyclage spécialisé', 'Matière première secondaire'],
    interestedSectors: ['Recyclage', 'PME industrielles', 'Entrepreneuriat vert'],
    valorizationLevel: 'medium',
    qualityLevel: 'À confirmer',
    riskLevel: 'À vérifier',
    riskText: 'Risque à confirmer par fiche technique, photos et échantillon.',
    recommendation: 'Ajouter des photos, la composition exacte et les conditions de stockage.',
    score: 62,
    priceFactorMin: 0.5,
    priceFactorMax: 1,
  },
}

function cleanText(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function clampScore(value: unknown, fallback: number) {
  const numeric = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numeric)) return fallback
  return Math.max(0, Math.min(100, Math.round(numeric)))
}

function asArray(value: unknown, fallback: string[]) {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).map((item) => item.trim())
  if (typeof value === 'string' && value.trim()) return [value.trim()]
  return fallback
}

function extractJsonObject(input: string) {
  const cleaned = input.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim()
  const firstBrace = cleaned.indexOf('{')
  const lastBrace = cleaned.lastIndexOf('}')
  if (firstBrace < 0 || lastBrace < 0 || lastBrace <= firstBrace) throw new Error('No JSON object found')
  return cleaned.slice(firstBrace, lastBrace + 1)
}

function normalizedInput(input: WasteAnalysisInput) {
  const quantity = Number(input.quantity ?? input.quantityKg ?? 0) || 0
  const pricePerUnit = Number(input.pricePerUnit ?? input.estimatedPrice ?? 0) || 0
  const unit = input.unit || 'kg'
  const location = input.location || input.city || 'Sfax'
  const title = input.title || `Lot de ${input.materialType || input.category || 'matière industrielle'}`
  const description = input.description || `Matière disponible à ${location} pour valorisation industrielle.`
  const materialType = input.materialType || input.category || inferImpactCategory(`${title} ${description}`)
  const categoryId = input.categoryId || input.category || inferImpactCategory(`${materialType} ${title} ${description}`)

  return {
    title,
    description,
    materialType,
    categoryId,
    industry: input.industry || 'recycling',
    quantity,
    unit,
    pricePerUnit,
    location,
  }
}

function inferProfileKey(input: ReturnType<typeof normalizedInput>) {
  const text = `${input.title} ${input.description} ${input.materialType} ${input.categoryId}`.toLowerCase()
  if (/(pet|pehd|hdpe|plastique|plastic|film|bouteille)/i.test(text)) return 'plastic'
  if (/(aluminium|metal|métal|acier|fer|cuivre|copeaux)/i.test(text)) return 'metal'
  if (/(bois|wood|palette|sciure)/i.test(text)) return 'wood'
  if (/(textile|tissu|coton|denim|fabric)/i.test(text)) return 'textile'
  if (/(carton|papier|paper|cardboard)/i.test(text)) return 'paper'
  if (/(huile|oil|lubrifiant)/i.test(text)) return 'oil'
  if (/(organic|organique|grignon|biomasse|olive|compost)/i.test(text)) return 'organic'
  const inferred = inferImpactCategory(text)
  return inferred === 'cardboard' ? 'paper' : inferred
}

function estimatePrices(input: ReturnType<typeof normalizedInput>, profile: MaterialProfile) {
  const base = input.pricePerUnit > 0 ? input.pricePerUnit : Math.max(0.15, input.quantity > 500 ? 0.75 : 1)
  const min = Math.max(0, Number((base * profile.priceFactorMin).toFixed(2)))
  const max = Math.max(min, Number((base * profile.priceFactorMax).toFixed(2)))
  return { min, max, label: `${min.toFixed(2)}–${max.toFixed(2)} TND/${input.unit}` }
}

function toLegacyLevel(score: number): ValorizationLevel {
  if (score >= 80) return 'high'
  if (score >= 50) return 'medium'
  return 'low'
}

function normalizeGeminiAnalysis(parsed: Record<string, unknown>, fallback: AiWasteAnalysis): AiWasteAnalysis {
  const detectedMaterial = cleanText(parsed.detectedMaterial, fallback.detectedMaterial || fallback.materialType)
  const category = cleanText(parsed.category, fallback.category || fallback.categoryId)
  const estimatedPriceMin = Number(parsed.estimatedPriceMin ?? fallback.estimatedPriceMin ?? 0) || 0
  const estimatedPriceMax = Number(parsed.estimatedPriceMax ?? fallback.estimatedPriceMax ?? estimatedPriceMin) || estimatedPriceMin
  const valorizationScore = clampScore(parsed.valorizationScore, fallback.valorizationScore ?? fallback.confidenceScore)
  const recommendationText = cleanText(parsed.recommendationText, fallback.recommendationText || fallback.recommendation)
  const riskLevel = cleanText(parsed.riskLevel, fallback.riskLevel || fallback.qualityRisk)
  const qualityLevel = cleanText(parsed.qualityLevel, fallback.qualityLevel || fallback.valorizationLevel)

  return {
    ...fallback,
    detectedMaterial,
    category,
    materialType: cleanText(parsed.materialType, detectedMaterial),
    categoryId: cleanText(parsed.categoryId, category),
    suggestedTitle: cleanText(parsed.suggestedTitle, fallback.suggestedTitle),
    improvedDescription: cleanText(parsed.improvedDescription, fallback.improvedDescription),
    possibleUses: asArray(parsed.possibleUses, fallback.possibleUses),
    interestedSectors: asArray(parsed.interestedSectors, fallback.interestedSectors),
    qualityLevel,
    riskLevel,
    valorizationScore,
    estimatedPriceMin,
    estimatedPriceMax,
    co2SavedKg: Number(parsed.co2SavedKg ?? fallback.co2SavedKg ?? 0) || 0,
    recommendationText,
    valorizationLevel: toLegacyLevel(valorizationScore),
    qualityRisk: riskLevel,
    estimatedPriceRange: `${estimatedPriceMin.toFixed(2)}–${estimatedPriceMax.toFixed(2)} TND/${fallback.estimatedPriceRange.split('/').pop() || 'kg'}`,
    recommendation: recommendationText,
    confidenceScore: valorizationScore,
    source: 'gemini',
  }
}

export function fallbackWasteAnalysis(input: WasteAnalysisInput): AiWasteAnalysis {
  const normalized = normalizedInput(input)
  const profileKey = inferProfileKey(normalized)
  const profile = materialProfiles[profileKey] ?? materialProfiles.default
  const impact = calculateListingImpact(normalized)
  const prices = estimatePrices(normalized, profile)
  const materialType = normalized.materialType || profile.label
  const categoryId = profile.categoryId === 'default' ? normalized.categoryId : profile.categoryId
  const suggestedTitle = normalized.title.trim() || `Lot de ${profile.label} disponible à ${normalized.location}`
  const improvedDescription = [
    `Lot industriel de ${normalized.quantity} ${normalized.unit} de ${materialType} situé à ${normalized.location}.`,
    normalized.description,
    `Potentiel estimé: ${impact.co2ReductionKg} kg CO₂ évités si le lot est réutilisé au lieu d’être éliminé.`,
  ].join(' ')

  return {
    materialType,
    categoryId,
    detectedMaterial: materialType,
    category: categoryId,
    suggestedTitle,
    improvedDescription,
    possibleUses: profile.possibleUses,
    interestedSectors: profile.interestedSectors,
    valorizationLevel: profile.valorizationLevel,
    qualityRisk: profile.riskText,
    estimatedPriceRange: prices.label,
    recommendation: profile.recommendation,
    confidenceScore: profile.score,
    source: 'fallback',
    qualityLevel: profile.qualityLevel,
    riskLevel: profile.riskLevel,
    valorizationScore: profile.score,
    estimatedPriceMin: prices.min,
    estimatedPriceMax: prices.max,
    co2SavedKg: impact.co2ReductionKg,
    recommendationText: profile.recommendation,
  }
}

export const analyzeWasteFallback = fallbackWasteAnalysis

export async function analyzeWasteWithAI(input: WasteAnalysisInput) {
  const normalized = normalizedInput(input)
  const fallback = fallbackWasteAnalysis(normalized)
  const impactEstimate = calculateListingImpact(normalized)

  if (!isGeminiConfigured()) {
    return { analysis: fallback, impactEstimate, source: 'fallback' as const }
  }

  const prompt = `Tu es un expert en valorisation des déchets industriels, économie circulaire et marketplace B2B en Tunisie.\n\nAnalyse le déchet industriel suivant et transforme une annonce simple en opportunité économique et environnementale.\n\nDéchet :\nTitre : ${normalized.title}\nDescription : ${normalized.description}\nMatière déclarée : ${normalized.materialType}\nCatégorie : ${normalized.categoryId}\nQuantité : ${normalized.quantity} ${normalized.unit}\nVille : ${normalized.location}\nPrix estimé : ${normalized.pricePerUnit} TND/${normalized.unit}\n\nRetourne uniquement un JSON valide, sans markdown, sans explication hors JSON.\n\nFormat exact :\n{\n  "detectedMaterial": "",\n  "category": "",\n  "suggestedTitle": "",\n  "improvedDescription": "",\n  "possibleUses": [],\n  "interestedSectors": [],\n  "qualityLevel": "",\n  "riskLevel": "",\n  "valorizationScore": 0,\n  "estimatedPriceMin": 0,\n  "estimatedPriceMax": 0,\n  "co2SavedKg": 0,\n  "recommendationText": ""\n}\n\nRègles :\n- Le score doit être entre 0 et 100.\n- Les prix doivent être réalistes pour une démonstration B2B en Tunisie.\n- Le style doit être professionnel et utile pour un vendeur industriel.\n- Le CO₂ évité doit utiliser : plastique = quantité × 1.8, métal = quantité × 2.5, bois = quantité × 0.9, textile = quantité × 1.4, papier/carton = quantité × 1.1, autre = quantité × 1.0.\n- Si la matière présente un risque, explique-le dans recommendationText.\n- Ne retourne aucun texte hors JSON.`

  const text = await generateGeminiText(prompt)
  if (!text) return { analysis: fallback, impactEstimate, source: 'fallback' as const }

  try {
    const parsed = JSON.parse(extractJsonObject(text)) as Record<string, unknown>
    const analysis = normalizeGeminiAnalysis(parsed, fallback)
    return { analysis, impactEstimate, source: 'gemini' as const }
  } catch (error) {
    console.warn('Invalid Gemini JSON for waste analysis, fallback used.', error)
    return { analysis: fallback, impactEstimate, source: 'fallback' as const }
  }
}

export async function analyzeWasteWithAi(input: WasteAnalysisInput) {
  return analyzeWasteWithAI(input)
}
