import { GoogleGenAI } from '@google/genai'

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash'

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY?.trim())
}

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) return null
  return new GoogleGenAI({ apiKey })
}

export async function generateGeminiText(prompt: string, options?: { model?: string }) {
  const client = getGeminiClient()
  if (!client) return null

  try {
    const response = await client.models.generateContent({
      model: options?.model || process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
      contents: prompt,
    })

    return response.text?.trim() || null
  } catch (error) {
    console.warn('Gemini unavailable, EcoBridge fallback AI will be used.', error)
    return null
  }
}
