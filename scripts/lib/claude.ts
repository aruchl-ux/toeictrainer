import Anthropic from '@anthropic-ai/sdk'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import type { z } from 'zod'

export const MODEL = 'claude-opus-5-5'

// Credentials resolve from ANTHROPIC_API_KEY or an `ant auth login` profile.
const client = new Anthropic()

export async function ask<S extends z.ZodType>(schema: S, system: string, user: string): Promise<z.infer<S>> {
  const res = await client.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    system,
    messages: [{ role: 'user', content: user }],
    output_config: { effort: 'high', format: zodOutputFormat(schema) }
  })
  if (res.stop_reason === 'refusal') throw new Error('Claude declined this request; try again or change the topic.')
  if (res.stop_reason === 'max_tokens') throw new Error('Output was truncated (max_tokens). Use a smaller --count.')
  if (!res.parsed_output) throw new Error('Claude returned output that did not match the schema.')
  return res.parsed_output
}
