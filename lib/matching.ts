import { distanceKm } from './geo'
import { Listing, MatchScore, Project } from './types'
import { getCoordsForCity } from './geo'
import { generateGeminiText, isGeminiConfigured } from './gemini'

const industryCompatibilityMatrix: Record<string, string[]> = {
  packaging: ['food', 'retail', 'logistics', 'recycling', 'plastic'],
  plastic: ['packaging', 'construction', 'automotive', 'textile', 'recycling'],
  wood: ['furniture', 'construction', 'biomass', 'agriculture'],
  furniture: ['wood', 'construction', 'biomass', 'agriculture'],
  textile: ['fashion', 'insulation', 'automotive', 'furniture'],
  metal: ['construction', 'machinery', 'automotive', 'electronics', 'recycling'],
  machining: ['metal', 'construction', 'machinery', 'automotive'],
  electronics: ['metal', 'recycling', 'machinery'],
  food: ['biogas', 'agriculture', 'animal-feed', 'biomass'],
  agriculture: ['food', 'biomass', 'animal-feed'],
  chemical: ['recycling', 'energy', 'maintenance'],
}

const materialAliases: Record<string, string[]> = {
  plastic: ['plastic', 'plastique', 'pet', 'pehd', 'hdpe', 'film', 'bouteille', 'emballage', 'بلاستيك'],
  metal: ['metal', 'métal', 'fer', 'acier', 'aluminium', 'cuivre', 'copeaux', 'cable', 'câble', 'حديد', 'نحاس'],
  wood: ['wood', 'bois', 'sciure', 'palette', 'خشب', 'نشارة'],
  textile: ['textile', 'tissu', 'denim', 'coton', 'fabric', 'قماش'],
  paper: ['paper', 'papier', 'carton', 'cardboard', 'كرتون'],
  oil: ['huile', 'oil', 'lubrifiant', 'friture', 'زيت'],
  organic: ['organic', 'organique', 'olive', 'grignon', 'coques', 'amandes', 'biomasse', 'فيتورة'],
}

function normalize(value: number, min: number, max: number) {
  if (max === min) return 0
  return Math.max(0, Math.min(1, (value - min) / (max - min)))
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function textContainsMaterial(text: string, need: string) {
  const normalizedText = text.toLowerCase()
  const normalizedNeed = need.toLowerCase()
  if (normalizedText.includes(normalizedNeed) || normalizedNeed.includes(normalizedText)) return true
  const aliases = materialAliases[normalizedNeed] ?? []
  return aliases.some((alias) => normalizedText.includes(alias))
}

export function getMatchBadge(total: number): MatchScore['badge'] {
  if (total >= 80) return 'Match fort'
  if (total >= 50) return 'Match moyen'
  return 'Opportunité à vérifier'
}

export function computeMatchScore(params: {
  listing: Listing
  project: Project
  preferredPricePerUnit?: number
  neededQuantity?: number
}): MatchScore {
  const { listing, project, preferredPricePerUnit = listing.pricePerUnit, neededQuantity = listing.quantity } = params

  const listingText = `${listing.materialType} ${listing.categoryId} ${listing.title} ${listing.description}`
  const materialSimilarity = project.needs.some((need) => textContainsMaterial(listingText, need)) ? 30 : 12

  const listingIndustry = listing.industry.toLowerCase()
  const projectIndustry = project.industry.toLowerCase()
  const compatibleIndustries = industryCompatibilityMatrix[listingIndustry] ?? industryCompatibilityMatrix[listing.categoryId.toLowerCase()] ?? []
  const industryCompatibility = compatibleIndustries.includes(projectIndustry)
    ? 20
    : listingIndustry === projectIndustry || listing.categoryId.toLowerCase() === projectIndustry
      ? 17
      : 9

  const projectCoords = getCoordsForCity(project.location)
  const dist = distanceKm(listing.lat, listing.lng, projectCoords.lat, projectCoords.lng)
  const distanceScore = Math.round((1 - normalize(dist, 0, 300)) * 20)

  const quantityGap = Math.abs(listing.quantity - neededQuantity)
  const quantityScore = Math.round((1 - normalize(quantityGap, 0, neededQuantity || 1)) * 10)

  const priceGap = Math.abs(listing.pricePerUnit - preferredPricePerUnit)
  const priceScore = Math.round((1 - normalize(priceGap, 0, preferredPricePerUnit || 1)) * 10)

  const urgency = String(listing.urgency).toLowerCase()
  const availability = String(listing.availability).toLowerCase()
  const urgencyScore = urgency === 'high' ? 5 : urgency === 'medium' ? 3 : 1
  const availabilityScore = availability === 'available' || availability === 'active' ? 5 : availability === 'reserved' ? 2 : 0

  const total = clampScore(
    materialSimilarity +
      industryCompatibility +
      distanceScore +
      quantityScore +
      priceScore +
      urgencyScore +
      availabilityScore,
  )
  const badge = getMatchBadge(total)
  const explanation = `${badge}: compatibilité ${total}/100 basée sur la matière, le secteur, la distance, la quantité, le prix, l'urgence et la disponibilité.`

  return {
    materialSimilarity,
    industryCompatibility,
    distanceScore,
    quantityScore,
    priceScore,
    urgencyScore,
    availabilityScore,
    total,
    badge,
    explanation,
    materialScore: materialSimilarity,
    sectorScore: industryCompatibility,
    locationScore: distanceScore,
    globalScore: total,
    criteria: [
      { label: 'Matière', value: `${listing.materialType} ↔ ${project.needs.join(', ')}`, score: materialSimilarity },
      { label: 'Secteur', value: `${listing.industry} ↔ ${project.industry}`, score: industryCompatibility },
      { label: 'Distance', value: `${Math.round(dist)} km de ${project.location}`, score: distanceScore },
      { label: 'Quantité', value: `${listing.quantity} ${listing.unit}`, score: quantityScore },
      { label: 'Prix', value: `${listing.pricePerUnit} TND/${listing.unit}`, score: priceScore },
      { label: 'Urgence', value: listing.urgency, score: urgencyScore },
      { label: 'Disponibilité', value: listing.availability, score: availabilityScore },
    ],
  }
}

export function rankListingsForProject(listings: Listing[], project: Project) {
  return listings
    .map((listing) => ({ listing, score: computeMatchScore({ listing, project }) }))
    .sort((a, b) => b.score.total - a.score.total)
}


export async function computeMatchScoreWithAiExplanation(params: {
  listing: Listing
  project: Project
  preferredPricePerUnit?: number
  neededQuantity?: number
}) {
  const score = computeMatchScore(params)
  if (!isGeminiConfigured()) return score

  const prompt = `Tu es EcoBridge Gemini, expert en matching B2B pour déchets industriels.
Explique en français, en 2 phrases maximum, pourquoi ce match a le score ${score.total}/100.
Annonce: ${params.listing.title}, matière ${params.listing.materialType}, quantité ${params.listing.quantity} ${params.listing.unit}, prix ${params.listing.pricePerUnit} TND/${params.listing.unit}, ville ${params.listing.location}.
Besoin: ${params.project.name}, secteur ${params.project.industry}, ville ${params.project.location}, matières ${params.project.needs.join(', ')}.
Ne change pas le score. Retourne uniquement une explication professionnelle.`
  const explanation = await generateGeminiText(prompt)
  return explanation ? { ...score, explanation } : score
}
