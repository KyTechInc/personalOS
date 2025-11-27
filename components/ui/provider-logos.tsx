import { SiOpenai, SiAnthropic, SiGoogle, SiX, SiPerplexity } from '@icons-pack/react-simple-icons'

interface ProviderLogoProps {
  provider: string
  size?: number
  className?: string
}

const providerIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  openai: SiOpenai,
  anthropic: SiAnthropic,
  google: SiGoogle,
  xai: SiX,
  perplexity: SiPerplexity,
}

const providerColors: Record<string, string> = {
  openai: 'text-green-400',
  anthropic: 'text-orange-400',
  google: 'text-blue-400',
  xai: 'text-black',
  perplexity: 'text-purple-400',
}

export function ProviderLogo({ provider, size = 16, className = '' }: ProviderLogoProps) {
  const IconComponent = providerIcons[provider.toLowerCase()]

  if (!IconComponent) {
    // Fallback to a generic icon or text
    return (
      <div
        className={`flex items-center justify-center rounded-sm bg-white/10 text-white/80 ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-xs font-bold">{provider.slice(0, 1).toUpperCase()}</span>
      </div>
    )
  }

  return (
    <IconComponent
      size={size}
      className={`${providerColors[provider.toLowerCase()] || 'text-white/80'} ${className}`}
    />
  )
}

interface ModelOptionProps {
  id: string
  name: string
  provider: string
  description?: string
}

export function ModelOption({ id: _id, name, provider, description }: ModelOptionProps) {
  return (
    <div className="flex items-center gap-3 px-2 py-1.5 text-sm hover:bg-white/5 rounded-sm cursor-pointer">
      <ProviderLogo provider={provider} size={20} />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-white/90">{name}</div>
        <div className="text-xs text-white/60">{provider}</div>
        {description && (
          <div className="text-xs text-white/40 mt-0.5">{description}</div>
        )}
      </div>
    </div>
  )
}
