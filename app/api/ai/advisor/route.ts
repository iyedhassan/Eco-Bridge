import { NextRequest } from 'next/server'
import { buildAdvisorContext, getListings } from '@/lib/backend'
import { detectAdvisorCity, runAiAdvisor } from '@/lib/ai-advisor'
import { fail, ok } from '@/lib/http'
import { getServerSession } from '@/lib/auth'
import { advisorSchema } from '@/lib/validation'
import { serializeUser } from '@/lib/serializers'
import { Project } from '@/lib/types'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsed = advisorSchema.safeParse(body)
  if (!parsed.success) return fail('Invalid advisor payload', 422)

  const session = await getServerSession()
  const description = parsed.data.description || parsed.data.projectType || ''
  const requestedLocation = parsed.data.location || detectAdvisorCity(description, 'Sfax')
  const requestedIndustry = parsed.data.industry || 'packaging'
  const publicLocationListings = session ? [] : await getListings({ location: requestedLocation, availability: 'available' })
  const publicListings = session || publicLocationListings.length ? publicLocationListings : await getListings({ availability: 'available' })

  const context = session
    ? await buildAdvisorContext(session.sub, description, parsed.data.industry, parsed.data.location)
    : {
        user: null,
        effectiveListings: publicListings,
        project: {
          id: 'public-advisor-project',
          ownerId: 'public',
          name: description || 'Besoin EcoBridge',
          industry: requestedIndustry,
          location: requestedLocation,
          needs: [description, requestedIndustry].filter(Boolean),
          budgetLevel: 'medium',
          createdAt: new Date().toISOString(),
        } satisfies Project,
      }

  const user = context.user ? serializeUser(context.user) : null
  const result = await runAiAdvisor({
    ...parsed.data,
    userIndustry: user?.industry,
    userLocation: user?.location,
    availableListings: context.effectiveListings,
    project: context.project,
  })
  return ok(result)
}
