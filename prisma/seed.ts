import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { calculateListingImpact } from '../lib/impact'
import { getCoordsForCity } from '../lib/geo'

const prisma = new PrismaClient()

const categories = [
  { id: 'plastic', name: 'Plastique', description: 'PET, PEHD, films plastiques et rebuts de packaging.' },
  { id: 'metal', name: 'Métal', description: 'Fer, acier, aluminium, cuivre et copeaux industriels.' },
  { id: 'wood', name: 'Bois', description: 'Palettes, sciure, chutes de bois et bois non traité.' },
  { id: 'textile', name: 'Textile', description: 'Chutes de tissus, coton, denim et fibres.' },
  { id: 'paper', name: 'Papier & carton', description: 'Carton compacté, papiers d’imprimerie et emballages.' },
  { id: 'organic', name: 'Organique', description: 'Grignon d’olive, coques, biomasse et déchets agro-industriels.' },
  { id: 'oil', name: 'Huiles', description: 'Huiles alimentaires et fluides à collecter.' },
]

const materials = [
  { id: 'mat_pet_scrap', name: 'Plastique PET', categoryId: 'plastic', unit: 'kg' },
  { id: 'mat_plastic_film', name: 'Film plastique', categoryId: 'plastic', unit: 'kg' },
  { id: 'mat_aluminium_scrap', name: 'Chutes aluminium', categoryId: 'metal', unit: 'kg' },
  { id: 'mat_copper', name: 'Déchets de cuivre', categoryId: 'metal', unit: 'kg' },
  { id: 'mat_wood_pallets', name: 'Palettes usagées', categoryId: 'wood', unit: 'pièce' },
  { id: 'mat_textile_cut', name: 'Chutes textile', categoryId: 'textile', unit: 'kg' },
  { id: 'mat_cardboard', name: 'Carton compacté', categoryId: 'paper', unit: 'kg' },
  { id: 'mat_olive_pomace', name: 'Grignon d’olive', categoryId: 'organic', unit: 'Tonne' },
  { id: 'mat_cooking_oil', name: 'Huile de friture', categoryId: 'oil', unit: 'L' },
]

function listingData(input: {
  title: string
  description: string
  materialId: string
  materialType: string
  categoryId: string
  industry: string
  quantity: number
  unit: string
  pricePerUnit: number
  location: string
  sellerId: string
  urgency?: 'LOW' | 'MEDIUM' | 'HIGH'
  photos: string[]
}) {
  const coords = getCoordsForCity(input.location)
  const impact = calculateListingImpact(input)
  return {
    ...input,
    lat: coords.lat,
    lng: coords.lng,
    quantityKg: impact.wasteReusedKg,
    availability: 'ACTIVE' as const,
    urgency: input.urgency || 'MEDIUM' as const,
    wasteReusedKg: impact.wasteReusedKg,
    co2ReductionKg: impact.co2ReductionKg,
    moneySavedTnd: impact.moneySavedTnd,
    storageAvoidedKg: impact.storageAvoidedKg,
  }
}

async function main() {
  const passwordHash = await bcrypt.hash('123456', 10)

  await prisma.notification.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.favorite.deleteMany()
  await prisma.message.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.request.deleteMany()
  await prisma.match.deleteMany()
  await prisma.materialNeed.deleteMany()
  await prisma.aIAnalysis.deleteMany()
  await prisma.listing.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.user.deleteMany()
  await prisma.material.deleteMany()
  await prisma.category.deleteMany()

  for (const category of categories) await prisma.category.create({ data: category })
  for (const material of materials) await prisma.material.create({ data: material })

  const admin = await prisma.user.create({
    data: {
      id: 'user_admin',
      name: 'Admin EcoBridge',
      email: 'admin@ecobridge.tn',
      passwordHash,
      role: 'ADMIN',
      profile: { create: { companyName: 'EcoBridge', sector: 'platform', location: 'Sfax', neededMaterialTypes: [], offeredWasteTypes: [] } },
    },
  })

  const seller = await prisma.user.create({
    data: {
      id: 'user_seller_sfax',
      name: 'Société Sfaxienne d’Emballage',
      email: 'seller@ecobridge.tn',
      passwordHash,
      role: 'INDUSTRIAL_COMPANY',
      profile: { create: { companyName: 'Société Sfaxienne d’Emballage', sector: 'packaging', location: 'Sfax', phone: '+216 74 000 000', offeredWasteTypes: ['plastic', 'paper', 'metal'], neededMaterialTypes: [], description: 'Entreprise industrielle générant des flux de déchets valorisables.' } },
    },
  })

  const startup = await prisma.user.create({
    data: {
      id: 'user_startup',
      name: 'RePack Sfax',
      email: 'startup@ecobridge.tn',
      passwordHash,
      role: 'STARTUP',
      profile: { create: { companyName: 'RePack Sfax', sector: 'packaging', location: 'Sfax', phone: '+216 55 000 000', offeredWasteTypes: [], neededMaterialTypes: ['plastic', 'paper', 'cardboard'], description: 'Startup qui fabrique des emballages recyclés.' } },
    },
  })

  const entrepreneur = await prisma.user.create({
    data: {
      id: 'user_entrepreneur',
      name: 'Green Maker',
      email: 'entrepreneur@ecobridge.tn',
      passwordHash,
      role: 'ENTREPRENEUR',
      profile: { create: { companyName: 'Green Maker', sector: 'furniture', location: 'Monastir', offeredWasteTypes: [], neededMaterialTypes: ['wood', 'textile'], description: 'Jeune projet de mobilier écologique.' } },
    },
  })

  const listings = [
    listingData({
      title: 'Lot de déchets plastiques PET triés à Sfax',
      description: 'Déchets PET propres issus d’une ligne de packaging, disponibles chaque semaine et stockés en sacs.',
      materialId: 'mat_pet_scrap',
      materialType: 'Plastique PET',
      categoryId: 'plastic',
      industry: 'packaging',
      quantity: 1800,
      unit: 'kg',
      pricePerUnit: 0.9,
      location: 'Sfax',
      sellerId: seller.id,
      urgency: 'HIGH',
      photos: ['https://images.unsplash.com/photo-1604187351574-c75ca79f5807?q=80&w=1200&auto=format&fit=crop'],
    }),
    listingData({
      title: 'Carton compacté provenant d’une zone commerciale',
      description: 'Carton sec, compacté en balles, prêt au transport vers papeterie ou projet packaging recyclé.',
      materialId: 'mat_cardboard',
      materialType: 'Carton compacté',
      categoryId: 'paper',
      industry: 'retail',
      quantity: 5000,
      unit: 'kg',
      pricePerUnit: 0.35,
      location: 'Sfax',
      sellerId: seller.id,
      photos: ['https://images.unsplash.com/photo-1605600659908-0ef719419d41?q=80&w=1200&auto=format&fit=crop'],
    }),
    listingData({
      title: 'Palettes bois usagées pour réemploi',
      description: 'Palettes partiellement abîmées, utilisables pour réparation, mobilier recyclé ou valorisation bois.',
      materialId: 'mat_wood_pallets',
      materialType: 'Palettes bois',
      categoryId: 'wood',
      industry: 'logistics',
      quantity: 260,
      unit: 'pièce',
      pricePerUnit: 2.5,
      location: 'Monastir',
      sellerId: seller.id,
      urgency: 'HIGH',
      photos: ['https://images.unsplash.com/photo-1590247813693-5541d1c609fd?q=80&w=1200&auto=format&fit=crop'],
    }),
    listingData({
      title: 'Chutes aluminium propres pour refonte',
      description: 'Chutes aluminium issues d’usinage, faible contamination huileuse, adaptées à la fonderie.',
      materialId: 'mat_aluminium_scrap',
      materialType: 'Aluminium',
      categoryId: 'metal',
      industry: 'machining',
      quantity: 3200,
      unit: 'kg',
      pricePerUnit: 0.75,
      location: 'Sousse',
      sellerId: seller.id,
      photos: ['https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?q=80&w=1200&auto=format&fit=crop'],
    }),
    listingData({
      title: 'Chutes textiles propres issues d’atelier',
      description: 'Chutes de tissu coton/polyester triées par couleur, adaptées au rembourrage ou à l’isolation.',
      materialId: 'mat_textile_cut',
      materialType: 'Chutes textile',
      categoryId: 'textile',
      industry: 'textile',
      quantity: 900,
      unit: 'kg',
      pricePerUnit: 0.55,
      location: 'Sfax',
      sellerId: seller.id,
      photos: ['https://images.unsplash.com/photo-1459501462159-97d5bded1416?q=80&w=1200&auto=format&fit=crop'],
    }),
    listingData({
      title: 'Film plastique transparent post-production',
      description: 'Film plastique transparent propre provenant de lignes d’emballage, disponible en balles.',
      materialId: 'mat_plastic_film',
      materialType: 'Film plastique PE',
      categoryId: 'plastic',
      industry: 'packaging',
      quantity: 1400,
      unit: 'kg',
      pricePerUnit: 0.65,
      location: 'Sfax',
      sellerId: seller.id,
      photos: ['https://images.unsplash.com/photo-1604187351574-c75ca79f5807?q=80&w=1200&auto=format&fit=crop'],
    }),
  ]

  for (const listing of listings) {
    const created = await prisma.listing.create({ data: listing })
    await prisma.aIAnalysis.create({
      data: {
        listingId: created.id,
        detectedMaterial: created.materialType,
        category: created.categoryId,
        qualityLevel: created.categoryId === 'plastic' || created.categoryId === 'metal' ? 'Bonne' : 'À vérifier',
        riskLevel: created.categoryId === 'organic' || created.categoryId === 'oil' ? 'Élevé' : 'Moyen',
        valorizationScore: created.categoryId === 'plastic' || created.categoryId === 'metal' ? 88 : 74,
        estimatedPriceMin: Number((created.pricePerUnit * 0.85).toFixed(2)),
        estimatedPriceMax: Number((created.pricePerUnit * 1.25).toFixed(2)),
        co2SavedKg: created.co2ReductionKg,
        recommendationText: 'Ajouter photos, fiche matière et fréquence de disponibilité pour augmenter le score de matching.',
        materialType: created.materialType,
        categoryId: created.categoryId,
        possibleUses: ['matière première secondaire', 'recyclage local', 'nouveau produit durable'],
        interestedSectors: ['recyclage', created.industry, 'entrepreneuriat vert'],
        valorizationLevel: created.categoryId === 'plastic' || created.categoryId === 'metal' ? 'high' : 'medium',
        qualityRisk: 'Vérifier la propreté, la composition exacte et les conditions de stockage.',
        estimatedPriceRange: `${(created.pricePerUnit * 0.85).toFixed(2)}–${(created.pricePerUnit * 1.25).toFixed(2)} TND/${created.unit}`,
        suggestedTitle: created.title,
        improvedDescription: `${created.description} Impact estimé: ${Math.round(created.co2ReductionKg)} kg CO₂ évités.`,
        recommendation: 'Ajouter photos, fiche matière et fréquence de disponibilité pour augmenter le score de matching.',
        confidenceScore: 86,
        source: 'seed',
        co2ReductionKg: created.co2ReductionKg,
      },
    })
  }

  const need = await prisma.materialNeed.create({
    data: {
      ownerId: startup.id,
      name: 'Besoin PET pour emballages recyclés',
      industry: 'packaging',
      location: 'Sfax',
      needs: ['plastic', 'PET', 'carton'],
      quantityKg: 1000,
      maxPricePerUnit: 1.2,
      budgetLevel: 'MEDIUM',
    },
  })

  const listing = await prisma.listing.findFirstOrThrow({ where: { categoryId: 'plastic' } })
  await prisma.match.create({
    data: {
      listingId: listing.id,
      materialNeedId: need.id,
      buyerId: startup.id,
      score: 88,
      materialScore: 30,
      sectorScore: 20,
      locationScore: 19,
      quantityScore: 9,
      priceScore: 8,
      status: 'ACTIVE',
      scoreTotal: 88,
      badge: 'Match fort',
      explanation: 'Match fort: même matière, même ville, prix compatible et disponibilité immédiate.',
      scorePayload: {
        materialSimilarity: 30,
        industryCompatibility: 20,
        distanceScore: 19,
        quantityScore: 9,
        priceScore: 8,
        urgencyScore: 5,
        availabilityScore: 5,
        total: 88,
        badge: 'Match fort',
        explanation: 'Match fort: même matière, même ville, prix compatible et disponibilité immédiate.',
        criteria: [],
      },
    },
  })

  await prisma.notification.createMany({
    data: [
      { userId: startup.id, type: 'NEW_MATCH', title: 'Match fort détecté', message: 'Un lot de PET à Sfax correspond à votre besoin.' },
      { userId: seller.id, type: 'NEW_REQUEST', title: 'Prêt pour la démonstration', message: 'Publiez ou acceptez une demande pour montrer le backend.' },
      { userId: admin.id, type: 'NEW_MATCH', title: 'Base initialisée', message: `Seed terminé avec ${listings.length} annonces.` },
    ],
  })

  console.log('EcoBridge database seeded.')
  console.log('Comptes test:')
  console.log('admin@ecobridge.tn / 123456')
  console.log('seller@ecobridge.tn / 123456')
  console.log('startup@ecobridge.tn / 123456')
  console.log('entrepreneur@ecobridge.tn / 123456')
}

main().finally(async () => prisma.$disconnect())
