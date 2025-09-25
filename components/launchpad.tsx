/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
'use client'

import React, { useEffect, useMemo } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LaunchpadApp {
  id: string
  name: string
  icon: string
}

interface LaunchpadProps {
  isOpen: boolean
  onClose: () => void
  apps: LaunchpadApp[]
}

export function Launchpad({ isOpen, onClose, apps }: LaunchpadProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  const pages = useMemo(() => {
    const perPage = 28 // 7 x 4 grid
    const chunks: LaunchpadApp[][] = []
    for (let i = 0; i < apps.length; i += perPage) chunks.push(apps.slice(i, i + perPage))
    return chunks
  }, [apps])

  return (
    <div
      aria-hidden={!isOpen}
      className={cn(
        'fixed inset-0 z-[60] transition-opacity duration-200',
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
      )}
    >
      <div className="absolute inset-0 bg-[rgba(8,8,8,0.75)] backdrop-blur-2xl" />
      <div className="relative h-full w-full flex flex-col items-center">
        <button
          aria-label="Close Launchpad"
          onClick={onClose}
          className="absolute right-4 top-3 rounded-md p-2 hover:bg-white/10"
        >
          <X className="size-5" />
        </button>

        <div className="container mx-auto mt-16 w-full flex-1 overflow-hidden">
          <div className="h-full w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex h-full w-max gap-8 px-10">
              {pages.map((page, i) => (
                <div key={`${i}`} className="grid grid-cols-7 grid-rows-4 gap-6 place-content-center min-w-[80vw]">
                  {page.map(app => (
                    <button
                      key={app.id}
                      className="group flex flex-col items-center gap-2"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt={app.name}
                        src={app.icon}
                        width={120}
                        height={120}
                        className="size-32 rounded-2xl shadow-2xl  transition-transform group-hover:scale-105"
                      />
                      <span className="text-xs text-white/90">{app.name}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Launchpad


