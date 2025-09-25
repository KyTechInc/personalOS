/** biome-ignore-all lint/correctness/useUniqueElementIds: <explanation> */
/** biome-ignore-all lint/performance/noImgElement: <explanation> */
/** biome-ignore-all lint/correctness/noEmptyPattern: <explanation> */
'use client'

import React, { useMemo, useState } from 'react'
import DockDemo from '@/components/dock'
import MacOSMenubar from '@/components/macos-menubar'
import Launchpad from '@/components/launchpad'
import Raycast from '@/components/raycast'
import FakeBrowser from '@/components/apps/fake-browser'
import WarpTerminal from '@/components/apps/warp-terminal'
import AIChat from '@/components/apps/ai-chat'
import { WindowManagerProvider } from '@/components/window-manager'
import { defaultApps } from '@/lib/dock-apps'

interface DesktopProps {
  className?: string
}

export default function Desktop({}: DesktopProps) {
  const [isLaunchpadOpen, setIsLaunchpadOpen] = useState(false)
  const [isBrowserOpen, setIsBrowserOpen] = useState(false)
  const [isWarpOpen, setIsWarpOpen] = useState(false)
  const [isAIChatOpen, setIsAIChatOpen] = useState(false)

  const launchpadApps = useMemo(() => defaultApps, [])

  // Listen for wallpaper changes from settings
  React.useEffect(() => {
    function onSet(e: Event) {
      const detail = (e as CustomEvent<{ url: string }>).detail
      if (!detail?.url) return
      const img = document.querySelector<HTMLImageElement>('#desktop-wallpaper')
      if (img) img.src = detail.url
    }
    window.addEventListener('ky-set-wallpaper', onSet as EventListener)
    return () => window.removeEventListener('ky-set-wallpaper', onSet as EventListener)
  }, [])

  return (
    <WindowManagerProvider>
      <div className="relative min-h-dvh w-full overflow-hidden">
      <MacOSMenubar />

      {/* Desktop wallpaper area */}
      <div className="absolute inset-0 -z-10 select-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          id="desktop-wallpaper"
          alt="Desktop wallpaper"
          src="/wallpaper2.webp"
          className="h-full w-full object-cover"
          width={3840}
          height={2160}
          loading="lazy"
        />
      </div>

      {/* Content layer (windows etc.) */}
      <div className="relative z-10 flex min-h-dvh flex-col pt-10">
        <div className="flex-1" />

        {/* Dock */}
        <div className="mb-3 flex w-full justify-center">
          <div className="pointer-events-auto">
            <DockDemo
              onAppClick={(appId) => {
                if (appId === 'launchpad') setIsLaunchpadOpen(true)
                if (appId === 'raycast') window.dispatchEvent(new Event('ky-open-raycast'))
                if (appId === 'safari') setIsBrowserOpen(true)
                if (appId === 'warp') setIsWarpOpen(true)
                if (appId === 'ai-chat') setIsAIChatOpen(true)
              }}
            />
          </div>
        </div>
      </div>

      <Launchpad isOpen={isLaunchpadOpen} onClose={() => setIsLaunchpadOpen(false)} apps={launchpadApps} />
      <Raycast />
        {isBrowserOpen && (
          <FakeBrowser
            sites={[
              { id: 'nextjs', title: 'Next.js', url: 'https://nextjs.org' },
              { id: 'github', title: 'GitHub', url: 'https://benchwarmers.app' },
              { id: 'hn', title: 'Hacker News', url: 'https://news.ycombinator.com' },
              { id: 'mdn', title: 'MDN', url: 'https://developer.mozilla.org' },
            ]}
            onClose={() => setIsBrowserOpen(false)}
          />
        )}
        {isWarpOpen && (
          <WarpTerminal onClose={() => setIsWarpOpen(false)} />
        )}
        {isAIChatOpen && (
          <AIChat onClose={() => setIsAIChatOpen(false)} />
        )}
      </div>
    </WindowManagerProvider>
  )
}


