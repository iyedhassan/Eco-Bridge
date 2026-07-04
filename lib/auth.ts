import bcrypt from 'bcryptjs'
import { JWTPayload, SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { UserRole } from './types'

export const AUTH_COOKIE = 'ecobridge_session'
const AUTH_SECRET = process.env.JWT_SECRET || process.env.AUTH_SECRET || 'ecobridge-dev-secret-change-me'

interface SessionPayload extends JWTPayload {
  sub: string
  role: UserRole
  email: string
  name: string
}

const secretKey = new TextEncoder().encode(AUTH_SECRET)

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function createSessionToken(payload: Omit<SessionPayload, 'iat' | 'exp'>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey)
}

export async function verifySessionToken(token: string) {
  const result = await jwtVerify<SessionPayload>(token, secretKey)
  return result.payload
}

export async function setAuthSessionCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function clearAuthSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_COOKIE)
}

export async function getServerSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE)?.value

  if (!token) return null

  try {
    return await verifySessionToken(token)
  } catch {
    return null
  }
}
