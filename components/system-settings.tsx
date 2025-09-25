/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
'use client'

import React, { useState } from 'react'
import OSWindow from '@/components/os-window'

interface SystemSettingsProps {
  onClose: () => void
}

export default function SystemSettings({ onClose }: SystemSettingsProps) {
  const [dockMagnification, setDockMagnification] = useState(true)
  const [dockSize, setDockSize] = useState(64)
  const [wallpaper, setWallpaper] = useState('/wallpaper.webp')

  return (
    <OSWindow title="System Settings" onClose={onClose} storageKey="window-settings">
      <div className="flex h-full">
        <aside className="w-56 shrink-0 border-r border-white/10 bg-black/30 p-3 text-[13px] text-white/80">
          <div className="mb-2 text-[12px] uppercase tracking-wide text-white/40">Settings</div>
          <ul className="space-y-1">
            <li className="rounded-md bg-white/10 px-2 py-1">Appearance</li>
            <li className="rounded-md px-2 py-1 hover:bg-white/10">Dock & Menu Bar</li>
            <li className="rounded-md px-2 py-1 hover:bg-white/10">Wallpaper</li>
          </ul>
        </aside>
        <main className="flex-1 p-4 text-[13px]">
          <section className="mb-6">
            <h2 className="mb-2 text-sm font-semibold">Dock</h2>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={dockMagnification} onChange={e => setDockMagnification(e.target.checked)} />
                Enable magnification (visual only)
              </label>
              <label className="ml-4 flex items-center gap-2">
                Size
                <input type="range" min={40} max={96} value={dockSize} onChange={e => setDockSize(Number(e.target.value))} />
              </label>
            </div>
          </section>
          <section>
            <h2 className="mb-2 text-sm font-semibold">Wallpaper</h2>
            <div className="flex items-center gap-2">
              <input value={wallpaper} onChange={e => setWallpaper(e.target.value)} className="w-full rounded-md border border-white/10 bg-black/20 px-2 py-1" />
              <button className="rounded-md bg-white/10 px-2 py-1 hover:bg-white/20" onClick={() => {
                const event = new CustomEvent('ky-set-wallpaper', { detail: { url: wallpaper } })
                window.dispatchEvent(event)
              }}>Set</button>
            </div>
          </section>
        </main>
      </div>
    </OSWindow>
  )
}


