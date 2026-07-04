import { NextRequest } from 'next/server'
import { buildAdvisorContext } from '@/lib/backend'
import { runAiAdvisor } from '@/lib/ai-advisor'
import { fail, ok } from '@/lib/http'
import { requireSession } from '@/lib/session-guard'
import { advisorSchema } from '@/lib/validation'
import { serializeUser } from '@/lib/serializers'

export async function POST(request: NextRequest) {
  const guard = await requireSession()
  if (guard.error) return guard.error

  const body = await request.json().catch(() => null)
  const parsed = advisorSchema.safeParse(body)
  if (!parsed.success) return fail('Invalid advisor payload', 422)

  const context = await buildAdvisorContext(guard.session.sub, parsed.data.description || parsed.data.projectType, parsed.data.industry, parsed.data.location)
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
