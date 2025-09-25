import { streamText, convertToModelMessages, type UIMessage } from 'ai'

export const maxDuration = 30

// Minimal in-repo profile context to constrain the assistant
const PROFILE_SNIPPETS: string[] = [
  'Name: Kyle McCracken. Also goes by Ky.',
  'Role: IT Specialist & Full Stack Developer. 15 years experience building with TypeScript, React, Next.js, Node.js, Tailwind, Shadcn UI, Radix UI.',
  'Interests: macOS UI, personal OS experiences, Raycast and Warp-inspired interfaces.',
  'Contact: Provide general info only; do not invent private details. If asked for non-public data, say you do not have it.',
]

function buildSystemPrompt(): string {
  return [
    'You are KyOS Assistant. Only answer questions about Kyle, KyOS, or the codebase. '
      + 'If a user asks about unrelated topics, politely decline and state you can only answer about Kyle.',
    'When unsure, say you do not know rather than fabricating.',
    'Profile context:',
    ...PROFILE_SNIPPETS.map(s => `- ${s}`),
  ].join('\n')
}

export async function POST(req: Request) {
  const {
    messages,
    model,
    webSearch,
  }: { messages: UIMessage[]; model: string; webSearch: boolean } = await req.json()

  const result = streamText({
    model: webSearch ? 'perplexity/sonar' : model,
    messages: convertToModelMessages(messages),
    system: buildSystemPrompt(),
  })

  return result.toUIMessageStreamResponse({ sendSources: true, sendReasoning: true })
}


