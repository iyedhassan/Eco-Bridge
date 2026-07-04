import { UserRole } from './types'

export const ALL_ROLES: UserRole[] = ['INDUSTRIAL_COMPANY', 'STARTUP', 'ENTREPRENEUR', 'ADMIN']

export function normalizeRole(value: unknown): UserRole {
  const raw = String(value || '').toUpperCase().trim()
  if (raw === 'SELLER' || raw === 'INDUSTRIAL' || raw === 'INDUSTRIAL_COMPANY') return 'INDUSTRIAL_COMPANY'
  if (raw === 'BUYER' || raw === 'PME' || raw === 'SME' || raw === 'STARTUP') return 'STARTUP'
  if (raw === 'INVESTOR' || raw === 'ENTREPRENEUR') return 'ENTREPRENEUR'
  if (raw === 'ADMIN') return 'ADMIN'
  return 'STARTUP'
}

export function roleLabel(role: UserRole) {
  switch (role) {
    case 'INDUSTRIAL_COMPANY':
      return 'Entreprise industrielle'
    case 'STARTUP':
      return 'Startup / PME'
    case 'ENTREPRENEUR':
      return 'Jeune entrepreneur'
    case 'ADMIN':
      return 'Administrateur'
  }
}

export function canPublishListing(role: UserRole) {
  return role === 'INDUSTRIAL_COMPANY' || role === 'ADMIN'
}

export function canBuy(role: UserRole) {
  return role === 'STARTUP' || role === 'ENTREPRENEUR' || role === 'ADMIN'
}
