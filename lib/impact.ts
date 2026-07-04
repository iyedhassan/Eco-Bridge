import { Listing } from './types'

export const CO2_COEFFICIENTS_KG: Record<string, number> = {
  plastic: 1.8,
  metal: 2.5,
  wood: 0.9,
  textile: 1.4,
  paper: 1.1,
  cardboard: 1.1,
  default: 1,
}

const CATEGORY_ALIASES: Array<{ category: string; keywords: string[] }> = [
  { category: 'plastic', keywords: ['plastic', 'plastique', 'pet', 'pehd', 'hdpe', 'film', 'bouteille', 'bouteilles', 'ميكة', 'بلاستيك'] },
  { category: 'metal', keywords: ['metal', 'métal', 'acier', 'fer', 'cuivre', 'aluminium', 'copeaux', 'câble', 'cable', 'حديد', 'نحاس'] },
  { category: 'wood', keywords: ['wood', 'bois', 'sciure', 'palette', 'pallet', 'خشب', 'نشارة'] },
  { category: 'textile', keywords: ['textile', 'tissu', 'denim', 'coton', 'fabric', 'قماش', 'نسيج'] },
  { category: 'paper', keywords: ['paper', 'papier', 'carton', 'cardboard', 'كرتون'] },
  { category: 'oil', keywords: ['huile', 'oil', 'lubrifiant', 'friture', 'زيت'] },
  { category: 'organic', keywords: ['organic', 'organique', 'olive', 'grignon', 'coques', 'amandes', 'biomasse', 'فيتورة', 'قشور'] },
]

export function inferImpactCategory(value: string) {
  const text = value.toLowerCase()
  for (const item of CATEGORY_ALIASES) {
    if (item.keywords.some((keyword) => text.includes(keyword))) return item.category
  }
  return 'default'
}


export function calculateEnvironmentalImpact(materialType: string, quantityKg: number) {
  const category = inferImpactCategory(materialType || 'default')
  const coefficient = CO2_COEFFICIENTS_KG[category] ?? CO2_COEFFICIENTS_KG.default
  const wasteReusedKg = Math.max(0, Number(quantityKg) || 0)
  const co2SavedKg = Number((wasteReusedKg * coefficient).toFixed(2))
  const landfillAvoidedKg = wasteReusedKg
  const estimatedSavings = Math.round(wasteReusedKg * 0.04 + co2SavedKg * 0.015)

  return {
    co2SavedKg,
    wasteReusedKg,
    landfillAvoidedKg,
    estimatedSavings,
    coefficient,
    category,
    explanation: `En réutilisant ${wasteReusedKg} kg de ${materialType || category}, EcoBridge estime ${co2SavedKg} kg CO₂ évités avec un coefficient ${coefficient}.`,
  }
}

export function getListingImpactCategory(listing: Pick<Listing, 'categoryId' | 'materialType' | 'title' | 'description'>) {
  const category = listing.categoryId?.toLowerCase()
  if (category && CO2_COEFFICIENTS_KG[category]) return category
  return inferImpactCategory(`${listing.materialType} ${listing.title} ${listing.description}`)
}

export function toKg(quantity: number, unit: string) {
  const normalizedUnit = unit.toLowerCase().trim()
  if (['ton', 'tonne', 't', 'tons', 'tonnes'].includes(normalizedUnit)) return quantity * 1000
  if (['l', 'litre', 'liter', 'litres', 'liters'].includes(normalizedUnit)) return quantity * 0.9
  if (['piece', 'pièce', 'pieces', 'pièces', 'unit', 'unité'].includes(normalizedUnit)) return quantity * 12
  return quantity
}

export function calculateListingImpact(listing: Pick<Listing, 'categoryId' | 'materialType' | 'title' | 'description' | 'quantity' | 'unit' | 'pricePerUnit'>) {
  const category = getListingImpactCategory(listing)
  const coefficient = CO2_COEFFICIENTS_KG[category] ?? CO2_COEFFICIENTS_KG.default
  const wasteReusedKg = Math.round(toKg(listing.quantity, listing.unit))
  const co2ReductionKg = Math.round(wasteReusedKg * coefficient)
  const resaleValueTnd = listing.quantity * listing.pricePerUnit
  const storageAvoidedKg = wasteReusedKg
  const moneySavedTnd = Math.round(resaleValueTnd * 0.22 + wasteReusedKg * 0.04)

  return {
    wasteReusedKg,
    co2ReductionKg,
    moneySavedTnd,
    storageAvoidedKg,
    coefficient,
    category,
    co2SavedKg: co2ReductionKg,
    landfillAvoidedKg: storageAvoidedKg,
    estimatedSavings: moneySavedTnd,
    explanation: `En réutilisant ${wasteReusedKg} kg de ${listing.materialType}, EcoBridge estime ${co2ReductionKg} kg CO₂ évités et ${moneySavedTnd} TND d’économie potentielle.`,
  }
}

export function calculatePortfolioImpact(listings: Array<Pick<Listing, 'categoryId' | 'materialType' | 'title' | 'description' | 'quantity' | 'unit' | 'pricePerUnit'>>) {
  return listings.reduce(
    (acc, listing) => {
      const impact = calculateListingImpact(listing)
      acc.wasteReusedKg += impact.wasteReusedKg
      acc.co2ReductionKg += impact.co2ReductionKg
      acc.moneySavedTnd += impact.moneySavedTnd
      acc.storageAvoidedKg += impact.storageAvoidedKg
      return acc
    },
    { wasteReusedKg: 0, co2ReductionKg: 0, moneySavedTnd: 0, storageAvoidedKg: 0 },
  )
}
