import Anthropic from '@anthropic-ai/sdk'
import { db, getSettings } from '../db/schema'
import { isoDate } from '../engine/dates'
import { buildSummary, type CoachSummary } from './summary'

export const COACH_MODEL = 'claude-sonnet-5-5'

export const SYSTEM_PROMPT = `You are a strength and conditioning coach reviewing four weeks of training data for one adult in their late 40s. They lift 3 times a week, run half-marathon distances, cycle, want to lose about 7 kg of body fat, keep their strength, and stay healthy as they age. They are not trying to add muscle mass.

You receive a JSON summary. Use only what it contains; if something you would need is missing, say so instead of guessing. Never invent numbers.

Reply in plain English, under 200 words, as:
1. One-sentence verdict.
2. Three to five short bullets: what is working, what is stalling, one concrete tweak for the next two weeks (volume, load, rest, running, or recovery), and a protein or calorie reminder only if the weight trend calls for it.

Your suggestions are advisory; the app does not change the plan automatically. This is not medical advice. If the data hints at rapid weight loss, or the user may be dealing with pain, injury, or chest or heart symptoms, tell them to see a physician.`

export async function collectSummary(): Promise<CoachSummary> {
  const [sessions, sets, bodyWeights, runs, rides, settings] = await Promise.all([
    db.sessions.toArray(), db.sets.toArray(), db.bodyWeights.toArray(), db.runs.toArray(), db.rides.toArray(), getSettings(),
  ])
  return buildSummary({ today: isoDate(), sessions, sets, bodyWeights, runs, rides, settings })
}

/**
 * Calls the Claude API directly from the browser with the user's own key (single-user app).
 * Only the aggregate summary is sent. Returns plain text for display.
 */
export async function requestReview(summary: CoachSummary, apiKey: string): Promise<string> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
  try {
    const response = await client.beta.messages.create({
      model: COACH_MODEL,
      max_tokens: 2000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'medium' },
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Training summary:\n${JSON.stringify(summary, null, 2)}` }],
    })
    if (response.stop_reason === 'refusal') throw new Error('The review was declined. Try again later.')
    const text = response.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('\n').trim()
    if (!text) throw new Error('The review came back empty. Try again.')
    return text
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) throw new Error('Claude rejected the API key. Check it in Settings.')
    if (e instanceof Anthropic.RateLimitError) throw new Error('Rate limited. Wait a minute and try again.')
    if (e instanceof Anthropic.APIConnectionError) throw new Error('Could not reach Claude. Check your connection.')
    if (e instanceof Anthropic.APIError) throw new Error(`Claude API error (${e.status}): ${e.message}`)
    throw e
  }
}
