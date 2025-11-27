import { streamText, convertToModelMessages, type UIMessage } from 'ai'
import { gateway } from '@ai-sdk/gateway'

// Check if AI Gateway is properly configured
const isGatewayConfigured = process.env.AI_GATEWAY_API_KEY && process.env.AI_GATEWAY_API_KEY.length > 0

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

// Get available models from AI Gateway
async function getAvailableModels() {
  // If gateway is not configured, immediately use fallback models
  if (!isGatewayConfigured) {
    console.log('AI Gateway not configured, using fallback models')
    return [
      { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'openai', description: 'OpenAI\'s latest model' },
      { id: 'anthropic/claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic', description: 'Anthropic\'s advanced model' },
      { id: 'google/gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'google', description: 'Google\'s multimodal model' },
      { id: 'xai/grok-2', name: 'Grok-2', provider: 'xai', description: 'xAI\'s helpful assistant' },
      { id: 'perplexity/sonar', name: 'Perplexity Sonar', provider: 'perplexity', description: 'Perplexity\'s search model' },
    ]
  }

  try {
    console.log('Attempting to fetch models from AI Gateway...')
    const models = await gateway.getAvailableModels()
    console.log('Gateway returned models:', models.models)

    const languageModels = models.models.filter(m => m.modelType === 'language')
    console.log('Filtered language models:', languageModels)

    if (languageModels.length > 0) {
      return languageModels
    } else {
      console.log('No language models found from gateway, using fallback')
      throw new Error('No language models available from gateway')
    }
  } catch (error) {
    console.error('Failed to fetch models from AI Gateway:', error)
    // Fallback to common models if gateway fails
    return [
      { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'openai', description: 'OpenAI\'s latest model' },
      { id: 'anthropic/claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic', description: 'Anthropic\'s advanced model' },
      { id: 'google/gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'google', description: 'Google\'s multimodal model' },
      { id: 'xai/grok-2', name: 'Grok-2', provider: 'xai', description: 'xAI\'s helpful assistant' },
      { id: 'perplexity/sonar', name: 'Perplexity Sonar', provider: 'perplexity', description: 'Perplexity\'s search model' },
    ]
  }
}

export async function POST(req: Request) {
  const {
    messages,
    model,
    webSearch,
  }: { messages: UIMessage[]; model: string; webSearch: boolean } = await req.json()

  // Use Perplexity for web search, otherwise use the selected model
  const selectedModel = webSearch ? 'perplexity/sonar' : model

  const result = streamText({
    model: gateway(selectedModel),
    messages: convertToModelMessages(messages),
    system: buildSystemPrompt(),
  })

  return result.toUIMessageStreamResponse({ sendSources: true, sendReasoning: true })
}

// API endpoint to get available models
export async function GET() {
  try {
    console.log('GET /api/chat - Fetching models for frontend...')
    console.log('AI Gateway configured:', isGatewayConfigured)
    const models = await getAvailableModels()
    console.log('Raw models from getAvailableModels:', models)

    // Transform models to include provider info for frontend
    const transformedModels = models.map(model => ({
      id: model.id,
      name: model.name || model.id.split('/')[1],
      provider: model.id.split('/')[0],
      description: 'description' in model ? model.description : undefined,
    }))

    console.log('Transformed models for frontend:', transformedModels)

    return Response.json({ models: transformedModels })
  } catch (error) {
    console.error('GET /api/chat - Failed to fetch models:', error)
    return Response.json(
      { error: 'Failed to fetch models', models: [] },
      { status: 500 }
    )
  }
}


