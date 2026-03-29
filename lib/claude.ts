import Anthropic from '@anthropic-ai/sdk'
import { Pill, Topic } from '@/types'

type KnowledgeFact = {
  id: string
  source_url: string
  summary: string
  key_facts: string[]
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const MODEL = 'claude-sonnet-4-20250514'

export async function generatePill(
  topic: Topic,
  recentPills: Pill[],
  knowledgeFacts: KnowledgeFact[]
): Promise<{ content: string; source_summary: string }> {
  const recentContent = recentPills
    .slice(0, 10)
    .map((p, i) => `${i + 1}. ${p.content}`)
    .join('\n\n')

  const factsContext = knowledgeFacts
    .map((kb) => `Source: ${kb.source_url}\nSummary: ${kb.summary}\nFacts: ${kb.key_facts.join('; ')}`)
    .join('\n\n---\n\n')

  const prompt = `You are an expert knowledge curator for the topic: "${topic.name}".

User's current level: ${topic.level}
Total pills sent so far: ${topic.pill_count}

${recentContent ? `PILLS ALREADY SENT TO THIS USER (avoid any overlap with these):\n${recentContent}\n\n` : ''}

${factsContext ? `RAW KNOWLEDGE BASE (use these facts as source material):\n${factsContext}\n\n` : ''}

Generate a single knowledge pill about "${topic.name}" following these strict rules:
1. EXACTLY 3-5 sentences — no more, no less
2. Must be non-obvious, surprising, or counter-intuitive — NOT introductory Wikipedia-level content
3. Must be appropriate for a ${topic.level} learner
4. End with a single thought-provoking hook question that makes the reader reflect
5. If using a real source, cite it naturally in the text
6. NEVER repeat anything from the pills already sent above
7. Focus on: unexpected connections, historical context, contrarian views, specific details, or cutting-edge research

Respond in this exact JSON format:
{
  "content": "The full pill text here (3-5 sentences including the hook question)",
  "source_summary": "Brief attribution or source note (or 'No specific source' if general knowledge)"
}`

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found in response')
    const parsed = JSON.parse(jsonMatch[0])
    return {
      content: parsed.content,
      source_summary: parsed.source_summary || 'No specific source',
    }
  } catch {
    return {
      content: responseText,
      source_summary: 'No specific source',
    }
  }
}

export async function researchTopic(topicName: string): Promise<{
  summary: string
  key_facts: string[]
  source_url: string
}[]> {
  const prompt = `You are a research assistant tasked with finding non-obvious, fascinating facts about: "${topicName}".

Your goal: find 5-10 surprising, counterintuitive, or little-known facts that would delight a curious learner.
Focus on: recent discoveries, historical surprises, expert disagreements, strange statistics, or unexpected connections.
Avoid: basic definitions, introductory overviews, or widely-known facts.

For each fact cluster, provide a real or plausible source URL.

Respond in this exact JSON format:
{
  "results": [
    {
      "summary": "A coherent paragraph summarizing a fascinating angle on this topic",
      "key_facts": ["Specific fact 1", "Specific fact 2", "Specific fact 3"],
      "source_url": "https://example.com/relevant-article"
    }
  ]
}

Return between 3-6 result objects. Make facts genuinely surprising and non-obvious.`

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    tools: [
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { type: 'web_search_20250305', name: 'web_search' } as any,
    ],
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  // Extract text from response (after any tool use)
  let responseText = ''
  for (const block of message.content) {
    if (block.type === 'text') {
      responseText = block.text
      break
    }
  }

  // If we got tool use but no final text, make a follow-up call
  if (!responseText && message.stop_reason === 'tool_use') {
    const toolResults: Anthropic.ToolResultBlockParam[] = []
    for (const block of message.content) {
      if (block.type === 'tool_use') {
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: 'Search results processed',
        })
      }
    }

    const followUp = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2000,
      tools: [
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { type: 'web_search_20250305', name: 'web_search' } as any,
      ],
      messages: [
        { role: 'user', content: prompt },
        { role: 'assistant', content: message.content },
        { role: 'user', content: toolResults },
      ],
    })

    for (const block of followUp.content) {
      if (block.type === 'text') {
        responseText = block.text
        break
      }
    }
  }

  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found')
    const parsed = JSON.parse(jsonMatch[0])
    return parsed.results || []
  } catch {
    // Fallback: return a single generic entry
    return [
      {
        summary: `Interesting research about ${topicName}`,
        key_facts: [`Researched topic: ${topicName}`],
        source_url: 'https://en.wikipedia.org',
      },
    ]
  }
}
