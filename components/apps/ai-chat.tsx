'use client'

import { useState, useEffect } from 'react'
import OSWindow from '@/components/os-window'
import { useChat } from '@ai-sdk/react'
import { Loader } from '@/components/ai-elements/loader'
import { Message, MessageContent } from '@/components/ai-elements/message'
import { Response } from '@/components/ai-elements/response'
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  type PromptInputMessage,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input'
import { GlobeIcon, RefreshCcwIcon, CopyIcon, Plus } from 'lucide-react'
import { Sources, SourcesContent, SourcesTrigger, Source } from '@/components/ai-elements/source'
import { Fragment } from 'react'
import { Actions, Action } from '@/components/ai-elements/actions'
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai-elements/reasoning'
import { ProviderLogo, ModelOption } from '@/components/ui/provider-logos'

interface AIChatProps {
  onClose: () => void
}

interface Model {
  id: string
  name: string
  provider: string
  description?: string
}

export default function AIChat({ onClose }: AIChatProps) {
  const { messages, status, sendMessage } = useChat()
  const [input, setInput] = useState('')
  const [model, setModel] = useState<string>('')
  const [webSearch, setWebSearch] = useState(false)
  const [models, setModels] = useState<Model[]>([])
  const [modelsLoading, setModelsLoading] = useState(true)

  // Fetch available models on component mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        console.log('Fetching models from API...')
        const response = await fetch('/api/chat')
        if (response.ok) {
          const data = await response.json()
          console.log('Received models:', data.models)
          setModels(data.models)
          // Set default model if available
          if (data.models.length > 0) {
            setModel(data.models[0].id)
          }
        } else {
          console.error('Failed to fetch models, status:', response.status)
          throw new Error('API request failed')
        }
      } catch (error) {
        console.error('Failed to fetch models:', error)
        // Fallback models - always use these for now until gateway is properly configured
        const fallbackModels: Model[] = [
          { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'openai', description: 'OpenAI\'s latest model' },
          { id: 'anthropic/claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic', description: 'Anthropic\'s advanced model' },
          { id: 'google/gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'google', description: 'Google\'s multimodal model' },
          { id: 'xai/grok-2', name: 'Grok-2', provider: 'xai', description: 'xAI\'s helpful assistant' },
          { id: 'perplexity/sonar', name: 'Perplexity Sonar', provider: 'perplexity', description: 'Perplexity\'s search model' },
        ]
        console.log('Using fallback models:', fallbackModels)
        setModels(fallbackModels)
        setModel(fallbackModels[0].id)
      } finally {
        setModelsLoading(false)
      }
    }

    fetchModels()
  }, [])

  function onSubmit(message: PromptInputMessage) {
    const hasText = Boolean(message.text)
    const hasAttachments = Boolean(message.files?.length)
    if (!(hasText || hasAttachments)) return

    sendMessage(
      { text: message.text || 'Sent with attachments', files: message.files },
      { body: { model, webSearch } }
    )
    setInput('')
  }

  return (
    <OSWindow title="AI Chat" onClose={onClose} storageKey="window-ai-chat" initialSize={{ width: 1100, height: 720 }}>
      <div className="flex h-full w-full flex-col" style={{ fontFamily: 'var(--font-geist-mono)' }}>
        {/* Dark terminal body */}
        <div className="flex-1 overflow-auto bg-black/70 p-3">
          {messages.map((message) => (
            <div key={message.id} className="mb-3 rounded-lg border border-white/10 bg-black/60 shadow-inner overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-[12px]">
                <div className="flex items-center gap-2">
                  <div className="truncate text-foreground">
                    {message.role === 'user' ? 'ai-chat' : 'assistant'}
                  </div>
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-green-400">●</span>
                      <span className="text-white/60">AI</span>
                      {(() => {
                        const messageModel = models.find(m => m.id === model)
                        return messageModel ? (
                          <>
                            <span className="text-white/60">●</span>
                            <ProviderLogo provider={messageModel.provider} size={12} />
                            <span className="text-white/60">{messageModel.name}</span>
                          </>
                        ) : null
                      })()}
                      {webSearch && (
                        <>
                          <span className="text-white/60">●</span>
                          <span className="text-blue-300">Web Search</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-white/40">
                  <button type="button" className="rounded-md px-1.5 py-0.5 hover:bg-white/10 text-xs">Copy Message</button>
                  <span className="text-white/60">●</span>
                  <span className="text-white/60">●</span>
                  <span className="text-white/60">●</span>
                </div>
              </div>
              <div className="px-3 py-2 text-[13px] text-white/90">
                {message.role === 'assistant' && message.parts.filter((p) => p.type === 'source-url').length > 0 && (
                  <div className="mb-2">
                    <Sources>
                      <SourcesTrigger count={message.parts.filter((p) => p.type === 'source-url').length} />
                      {message.parts.filter((p) => p.type === 'source-url').map((part, i) => (
                        <SourcesContent key={`${message.id}-${i}`}>
                          <Source key={`${message.id}-${i}`} href={part.url} title={part.url} />
                        </SourcesContent>
                      ))}
                    </Sources>
                  </div>
                )}
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case 'text':
                      return (
                        <Fragment key={`${message.id}-${i}`}>
                          <div className="mb-2 text-white/90">
                            <Response>{part.text}</Response>
                          </div>
                          {message.role === 'assistant' && message.id === messages.at(-1)?.id && (
                            <Actions className="mt-2">
                              <Action onClick={() => sendMessage({ text: input || 'Retry' })} label="Retry">
                                <RefreshCcwIcon className="size-3" />
                              </Action>
                              <Action onClick={() => navigator.clipboard.writeText(part.text)} label="Copy">
                                <CopyIcon className="size-3" />
                              </Action>
                            </Actions>
                          )}
                        </Fragment>
                      )
                    case 'reasoning':
                      return (
                        <Reasoning
                          key={`${message.id}-${i}`}
                          className="w-full mb-2"
                          isStreaming={status === 'streaming' && i === message.parts.length - 1 && message.id === messages.at(-1)?.id}
                        >
                          <ReasoningTrigger />
                          <ReasoningContent>{part.text}</ReasoningContent>
                        </Reasoning>
                      )
                    default:
                      return null
                  }
                })}
              </div>
            </div>
          ))}
          {status === 'submitted' && <Loader />}
        </div>

        {/* Input area */}
        <div className="rounded-lg border border-white/10 bg-black/60">
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-[12px] text-cyan-300/90">
            <div className="truncate">ai-chat</div>
            <div className="flex items-center gap-2 text-white/40">
              <button type="button" className="rounded-md px-1.5 py-0.5 hover:bg-white/10">New Chat</button>
            </div>
          </div>
          <div className="px-3 py-2">
            <PromptInput onSubmit={onSubmit} className="w-full" globalDrop multiple>
              <PromptInputBody>
                <PromptInputAttachments>
                  {(attachment) => <PromptInputAttachment data={attachment} />}
                </PromptInputAttachments>
                <PromptInputTextarea
                  onChange={(e) => setInput(e.target.value)}
                  value={input}
                  placeholder="Ask me anything... (try: 'What is the weather?' or 'Explain quantum computing')"
                  className="bg-transparent outline-none placeholder:text-white/30 text-white/90"
                />
              </PromptInputBody>
              <PromptInputToolbar>
                <PromptInputTools>
                  <PromptInputActionMenu>
                    <PromptInputActionMenuTrigger />
                    <PromptInputActionMenuContent>
                      <PromptInputActionAddAttachments />
                    </PromptInputActionMenuContent>
                  </PromptInputActionMenu>
                  <PromptInputButton variant={webSearch ? 'default' : 'ghost'} onClick={() => setWebSearch(!webSearch)}>
                    <GlobeIcon size={16} />
                    <span>Search</span>
                  </PromptInputButton>
              <PromptInputModelSelect onValueChange={(v) => setModel(v)} value={model}>
                <PromptInputModelSelectTrigger className="relative">
                  {modelsLoading ? (
                    <div className="flex items-center gap-2 text-white/60">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white/60 rounded-full animate-spin" />
                      <span>Loading models...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-white/90">
                      {(() => {
                        const currentModel = models.find(m => m.id === model)
                        return currentModel ? (
                          <>
                            <ProviderLogo provider={currentModel.provider} size={16} />
                            <span>{currentModel.name}</span>
                            <span className="text-white/60 text-xs">{currentModel.provider}</span>
                          </>
                        ) : (
                          <span className="text-white/60">Select model...</span>
                        )
                      })()}
                    </div>
                  )}
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent
                  className="bg-black/95 border-white/20 text-white"
                  side="bottom"
                  align="start"
                  sideOffset={4}
                  avoidCollisions={true}
                  style={{
                    zIndex: 9999,
                    position: 'fixed'
                  }}
                >
                  {modelsLoading ? (
                    <div className="p-4 text-center text-white/60">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white/60 rounded-full animate-spin mx-auto mb-2" />
                      Loading available models...
                    </div>
                  ) : (
                    models.map((m) => (
                      <PromptInputModelSelectItem key={m.id} value={m.id}>
                        <div className="flex items-center gap-3 w-full">
                          <ProviderLogo provider={m.provider} size={20} />
                          <div className="flex-1">
                            <div className="font-medium text-white/90">{m.name}</div>
                            <div className="text-xs text-white/60">{m.provider}</div>
                          </div>
                        </div>
                      </PromptInputModelSelectItem>
                    ))
                  )}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
                </PromptInputTools>
                <PromptInputSubmit disabled={!input && !status} status={status} />
              </PromptInputToolbar>
            </PromptInput>
          </div>
        </div>

        {/* Footer quick actions */}
        <div className="flex items-center gap-2 border-t border-white/10 bg-black/60 px-3 py-2 text-[12px] text-white/70">
          <button type="button" className="rounded-md bg-white/10 px-2 py-1 hover:bg-white/20">
            <Plus className="mr-1 inline size-3.5" /> New Block
          </button>
          <button type="button" className="rounded-md bg-white/10 px-2 py-1 hover:bg-white/20">
            AI Assistant
          </button>
          <button type="button" className="rounded-md bg-white/10 px-2 py-1 hover:bg-white/20">
            Clear Chat
          </button>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-green-400">●</span>
              <span className="text-cyan-300/90">AI Chat</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-green-400">●</span>
              <span className="text-green-400/80">{status === 'streaming' ? 'Thinking...' : 'Ready'}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-blue-300">●</span>
              <span className="text-white/60">{messages.length} messages</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-purple-300">●</span>
              <span className="text-white/60">
                {models.find(m => m.id === model)?.name || model}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-white/60">●</span>
              <span className="text-white/60">●</span>
              <span className="text-white/60">●</span>
            </div>
          </div>
        </div>
      </div>
    </OSWindow>
  )
}


