import { calculatePortfolioImpact } from './impact'
import { rankListingsForProject } from './matching'
import { AdvisorResult, Listing, Project } from './types'
import { generateGeminiText, isGeminiConfigured } from './gemini'

type MaterialHint = {
  material: string
  keywords: string[]
  ideas: string[]
  sectors: string[]
  industry: string
}

const materialHints: MaterialHint[] = [
  {
    material: 'Plastique PET / PEHD',
    keywords: ['plastic', 'plastique', 'pet', 'peet', 'pehd', 'hdpe', 'film', 'bouteille'],
    ideas: ['granules recycles', 'emballages secondaires', 'fibres polyester', 'plaques plastiques recyclees'],
    sectors: ['Packaging', 'Plasturgie', 'Textile technique', 'Recyclage plastique'],
    industry: 'packaging',
  },
  {
    material: 'Metal / acier / aluminium',
    keywords: ['metal', 'metaux', 'fer', 'acier', 'aluminium', 'alu', 'cuivre', 'fonderie', 'refonte'],
    ideas: ['fonderie', 'pieces secondaires', 'revente a recycleur metal', 'matiere premiere de refonte'],
    sectors: ['Fonderie', 'Construction', 'Usinage', 'Recyclage metal'],
    industry: 'machining',
  },
  {
    material: 'Bois et palettes',
    keywords: ['wood', 'bois', 'palette', 'palettes', 'sciure', 'meuble', 'mobilier'],
    ideas: ['mobilier recycle', 'panneaux compresses', 'biomasse', 'reemploi logistique'],
    sectors: ['Ameublement', 'Construction legere', 'Biomasse', 'Agriculture'],
    industry: 'furniture',
  },
  {
    material: 'Textile industriel',
    keywords: ['textile', 'tissu', 'fabric', 'coton', 'denim', 'vetement', 'isolation'],
    ideas: ['isolation thermique', 'rembourrage', 'chiffons industriels', 'fibres recyclees'],
    sectors: ['Textile', 'Automobile', 'Isolation', 'Ameublement'],
    industry: 'textile',
  },
  {
    material: 'Papier / carton',
    keywords: ['papier', 'paper', 'carton', 'cardboard', 'imprimerie'],
    ideas: ['carton ondule recycle', 'calage emballage', 'pate recyclee', 'papier recycle'],
    sectors: ['Packaging', 'Papeterie', 'Logistique', 'Imprimerie'],
    industry: 'packaging',
  },
]

const genericMaterialHint: MaterialHint = {
  material: 'Matiere industrielle a qualifier',
  keywords: [],
  ideas: ['tri par composition', 'test sur echantillon', 'reemploi industriel', 'recyclage specialise'],
  sectors: ['Recyclage', 'PME industrielles', 'Bureaux d etudes', 'Entrepreneuriat vert'],
  industry: 'recycling',
}

type RunAdvisorParams = {
  description?: string
  projectType?: string
  industry?: string
  location?: string
  userIndustry?: string
  userLocation?: string
  availableListings?: Listing[]
  project?: Project
}

export function generateProfessionalContactMessage(input: {
  material?: string
  city?: string
  objective?: string
  listingTitle?: string
}) {
  const material = input.material || 'matiere industrielle reutilisable'
  const city = input.city || 'votre region'
  const objective = input.objective || 'un projet d economie circulaire'
  const intro = input.listingTitle
    ? `Nous sommes interesses par votre annonce "${input.listingTitle}".`
    : `Nous sommes interesses par votre lot de ${material} disponible a ${city}.`

  return `Bonjour,

${intro}
Notre objectif est de reutiliser cette matiere pour ${objective}.

Pouvez-vous confirmer :
- la quantite disponible ;
- l'etat de la matiere ;
- le prix final ;
- la disponibilite ;
- les conditions de recuperation ?

Cordialement,`
}

export function detectAdvisorCity(text: string, fallback = 'Sfax') {
  const cities = ['Sfax', 'Tunis', 'Sousse', 'Monastir', 'Gabes', 'Gabès', 'Bizerte', 'Nabeul', 'Kairouan']
  const normalized = text.toLowerCase()
  const found = cities.find((city) => normalized.includes(city.toLowerCase()))
  return found === 'Gabès' ? 'Gabes' : found || fallback
}

function detectGoal(text: string) {
  const normalized = text.toLowerCase()
  if (normalized.includes('emballage') || normalized.includes('packaging')) return 'fabriquer des emballages recycles'
  if (normalized.includes('meuble') || normalized.includes('mobilier')) return 'fabriquer du mobilier recycle'
  if (normalized.includes('isolation')) return 'developper des solutions d isolation'
  if (normalized.includes('biodiesel')) return 'produire du biodiesel ou une valorisation energetique controlee'
  if (normalized.includes('fonderie') || normalized.includes('refonte')) return 'alimenter une ligne de refonte'
  if (normalized.includes('papier') || normalized.includes('carton')) return 'produire des emballages ou supports papier recycles'
  return 'un projet d economie circulaire'
}

function extractJsonObject(input: string) {
  const cleaned = input.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim()
  const firstBrace = cleaned.indexOf('{')
  const lastBrace = cleaned.lastIndexOf('}')
  if (firstBrace < 0 || lastBrace < 0 || lastBrace <= firstBrace) throw new Error('No JSON object found')
  return cleaned.slice(firstBrace, lastBrace + 1)
}

function inferMaterials(text: string) {
  const normalized = text.toLowerCase()
  const found = materialHints.filter((hint) => hint.keywords.some((keyword) => normalized.includes(keyword)))
  return found.length ? found : [genericMaterialHint]
}

function fallbackAdvisor(params: RunAdvisorParams): AdvisorResult {
  const text = [params.description, params.projectType, params.industry, params.location].filter(Boolean).join(' ')
  const materials = inferMaterials(text)
  const primaryMaterial = materials[0] ?? genericMaterialHint
  const availableListings = params.availableListings ?? []
  const detectedCity = detectAdvisorCity(text, params.location || params.userLocation || params.project?.location || 'Sfax')
  const detectedGoal = detectGoal(text)
  const detectedIndustry = params.industry || params.userIndustry || primaryMaterial.industry

  const advisorProject: Project = {
    id: params.project?.id || 'advisor-project',
    ownerId: params.project?.ownerId || 'advisor',
    name: params.projectType || params.description || params.project?.name || 'Besoin de matiere recyclee',
    industry: detectedIndustry,
    location: detectedCity,
    needs: Array.from(new Set(materials.flatMap((item) => [item.material, ...item.keywords.slice(0, 4)]))),
    quantityKg: params.project?.quantityKg,
    maxPricePerUnit: params.project?.maxPricePerUnit,
    budgetLevel: params.project?.budgetLevel || 'medium',
    createdAt: params.project?.createdAt || new Date().toISOString(),
  }

  const matchedOpportunities = rankListingsForProject(availableListings, advisorProject).slice(0, 5)
  const nearbyListings = matchedOpportunities.length ? matchedOpportunities.map((item) => item.listing) : availableListings.slice(0, 5)
  const impact = calculatePortfolioImpact(nearbyListings)
  const materialNames = materials.map((item) => item.material)
  const ideas = materials.flatMap((item) => item.ideas).slice(0, 8)
  const sectors = materials.flatMap((item) => item.sectors).slice(0, 6)
  const firstListing = matchedOpportunities[0]?.listing
  const contactMessage = firstListing
    ? generateProfessionalContactMessage({ material: firstListing.materialType, city: firstListing.location, objective: detectedGoal, listingTitle: firstListing.title })
    : generateProfessionalContactMessage({ material: materialNames[0], city: detectedCity, objective: detectedGoal })

  return {
    projectSummary: `Besoin identifie: ${params.description || params.projectType || 'recherche de matieres premieres alternatives'} | matiere: ${materialNames.join(', ')} | ville: ${detectedCity} | objectif: ${detectedGoal}.`,
    mainMaterial: materialNames[0],
    detectedCity,
    detectedGoal,
    byproducts: materialNames,
    reuseTargets: sectors,
    alternatives: materialNames.map((item) => `${item} issu de flux industriels locaux`),
    recommendedMaterials: materialNames,
    valorizationIdeas: ideas,
    nextSteps: [
      `Verifier les lots disponibles autour de ${detectedCity}.`,
      `Demander photos, fiche technique et conditions de stockage pour ${materialNames[0]}.`,
      'Comparer le score, le prix, la quantite et la disponibilite.',
      'Envoyer le message professionnel au vendeur le plus pertinent.',
    ],
    contactMessage,
    professionalMessage: contactMessage,
    nearbyListings,
    matchedOpportunities,
    ecoImpactEstimate: impact,
  }
}

function normalizeAdvisor(parsed: Partial<AdvisorResult>, fallback: AdvisorResult): AdvisorResult {
  return {
    ...fallback,
    projectSummary: typeof parsed.projectSummary === 'string' && parsed.projectSummary.trim() ? parsed.projectSummary : fallback.projectSummary,
    mainMaterial: typeof parsed.mainMaterial === 'string' && parsed.mainMaterial.trim() ? parsed.mainMaterial : fallback.mainMaterial,
    detectedCity: typeof parsed.detectedCity === 'string' && parsed.detectedCity.trim() ? parsed.detectedCity : fallback.detectedCity,
    detectedGoal: typeof parsed.detectedGoal === 'string' && parsed.detectedGoal.trim() ? parsed.detectedGoal : fallback.detectedGoal,
    byproducts: Array.isArray(parsed.byproducts) && parsed.byproducts.length ? parsed.byproducts.filter((item): item is string => typeof item === 'string') : fallback.byproducts,
    reuseTargets: Array.isArray(parsed.reuseTargets) && parsed.reuseTargets.length ? parsed.reuseTargets.filter((item): item is string => typeof item === 'string') : fallback.reuseTargets,
    alternatives: Array.isArray(parsed.alternatives) && parsed.alternatives.length ? parsed.alternatives.filter((item): item is string => typeof item === 'string') : fallback.alternatives,
    recommendedMaterials: Array.isArray(parsed.recommendedMaterials) && parsed.recommendedMaterials.length ? parsed.recommendedMaterials.filter((item): item is string => typeof item === 'string') : fallback.recommendedMaterials,
    valorizationIdeas: Array.isArray(parsed.valorizationIdeas) && parsed.valorizationIdeas.length ? parsed.valorizationIdeas.filter((item): item is string => typeof item === 'string') : fallback.valorizationIdeas,
    nextSteps: Array.isArray(parsed.nextSteps) && parsed.nextSteps.length ? parsed.nextSteps.filter((item): item is string => typeof item === 'string') : fallback.nextSteps,
    contactMessage: typeof parsed.contactMessage === 'string' && parsed.contactMessage.trim() ? parsed.contactMessage : fallback.contactMessage,
    professionalMessage: typeof parsed.professionalMessage === 'string' && parsed.professionalMessage.trim() ? parsed.professionalMessage : fallback.professionalMessage,
  }
}

export async function runAiAdvisor(params: RunAdvisorParams): Promise<AdvisorResult> {
  const fallback = fallbackAdvisor(params)
  if (!isGeminiConfigured()) return fallback

  try {
    const listingsContext = fallback.matchedOpportunities.map((item) => ({
      title: item.listing.title,
      material: item.listing.materialType,
      location: item.listing.location,
      score: item.score.total,
      price: item.listing.pricePerUnit,
      unit: item.listing.unit,
    }))

    const prompt = [
      'Tu es Gemini pour EcoBridge, conseiller B2B en economie circulaire industrielle en Tunisie.',
      'Reponds uniquement en JSON valide, sans markdown.',
      'Cles attendues: projectSummary, mainMaterial, detectedCity, detectedGoal, byproducts(array), reuseTargets(array), alternatives(array), recommendedMaterials(array), valorizationIdeas(array), nextSteps(array), contactMessage, professionalMessage.',
      `Besoin utilisateur: ${params.description || params.projectType || ''}`,
      `Secteur detecte ou fourni: ${params.industry || params.userIndustry || fallback.mainMaterial || ''}`,
      `Ville detectee ou fournie: ${params.location || params.userLocation || fallback.detectedCity || ''}`,
      `Opportunites disponibles avec scores: ${JSON.stringify(listingsContext)}`,
      'Le resultat doit changer selon le besoin utilisateur et rester pratique pour une vraie negociation acheteur/vendeur.',
    ].join('\n')

    const text = await generateGeminiText(prompt)
    if (!text) return fallback
    const parsed = JSON.parse(extractJsonObject(text)) as Partial<AdvisorResult>
    return normalizeAdvisor(parsed, fallback)
  } catch {
    return fallback
  }
}
