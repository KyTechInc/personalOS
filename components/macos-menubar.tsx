/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
'use client'

import React, { useEffect, useState } from 'react'
import {
  Menubar as MenubarRoot,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
} from '@/components/ui/menubar'
import { BatteryMedium, BatteryFull, BatteryCharging, Search, Volume2, Bell, Bluetooth, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import AboutThisMac from '@/components/about-this-mac'
import SystemSettings from '@/components/system-settings'
import Image from 'next/image'
import WifiIcon from '@/components/icons/wifi'

interface MacOSMenubarProps {
  className?: string
}

function formatTime(date: Date): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  return formatter.format(date)
}

export function MacOSMenubar({ className }: MacOSMenubarProps) {
  const [now, setNow] = useState<Date>(new Date())
  const [isCharging, setIsCharging] = useState<boolean>(false)
  const [batteryLevel, setBatteryLevel] = useState<number>(0.86)
  const [showAbout, setShowAbout] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 15_000)
    return () => clearInterval(i)
  }, [])

  // Placeholder battery state; could be wired to Battery Status API if available
  useEffect(() => {
    setIsCharging(false)
    setBatteryLevel(0.86)
  }, [])

  return (
    <div
      className={cn(
        'fixed inset-x-0 top-0 z-50 flex h-8 items-center justify-between px-2 sm:px-3',
        'backdrop-blur-md border-b border-white/10',
        'bg-[rgba(6,6,6,0.65)]',
        className,
      )}
    >
      <div className="flex items-center gap-1">
        <MenubarRoot className="bg-transparent border-0 shadow-none p-0 h-8">
          <MenubarMenu>
            <MenubarTrigger className="px-1.5 py-0.5 rounded-md hover:bg-white/5 data-[state=open]:bg-white/10">
              <Image src="/apple_dark.svg" alt="Apple" width={16} height={16} className="size-4" />
            </MenubarTrigger>
            <MenubarContent className="min-w-[14rem]">
              <MenubarItem onClick={() => setShowAbout(true)}>About This Mac</MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={() => setShowSettings(true)}>System Settings…</MenubarItem>
              <MenubarItem>App Store…</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Sleep</MenubarItem>
              <MenubarItem>Restart…</MenubarItem>
              <MenubarItem variant="destructive">Shut Down…</MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger className="px-2 py-0.5 rounded-md hover:bg-white/5 data-[state=open]:bg-white/10 font-semibold">Finder</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>About Finder</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Preferences…</MenubarItem>
              <MenubarSeparator />
              <MenubarSub>
                <MenubarSubTrigger>Services</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem>None</MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
              <MenubarSeparator />
              <MenubarItem>Hide Finder</MenubarItem>
              <MenubarItem>Hide Others</MenubarItem>
              <MenubarItem>Show All</MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger className="px-2 py-0.5 rounded-md hover:bg-white/5 data-[state=open]:bg-white/10">File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>New Finder Window</MenubarItem>
              <MenubarItem>New Folder</MenubarItem>
              <MenubarItem>Open</MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger className="px-2 py-0.5 rounded-md hover:bg-white/5 data-[state=open]:bg-white/10">Edit</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Undo</MenubarItem>
              <MenubarItem>Redo</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Cut</MenubarItem>
              <MenubarItem>Copy</MenubarItem>
              <MenubarItem>Paste</MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger className="px-2 py-0.5 rounded-md hover:bg-white/5 data-[state=open]:bg-white/10">View</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>as Icons</MenubarItem>
              <MenubarItem>as List</MenubarItem>
              <MenubarItem>as Columns</MenubarItem>
              <MenubarItem>as Gallery</MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger className="px-2 py-0.5 rounded-md hover:bg-white/5 data-[state=open]:bg-white/10">Go</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Home</MenubarItem>
              <MenubarItem>Documents</MenubarItem>
              <MenubarItem>Downloads</MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger className="px-2 py-0.5 rounded-md hover:bg-white/5 data-[state=open]:bg-white/10">Window</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Minimize</MenubarItem>
              <MenubarItem>Zoom</MenubarItem>
              <MenubarItem>Bring All to Front</MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger className="px-2 py-0.5 rounded-md hover:bg-white/5 data-[state=open]:bg-white/10">Help</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>macOS Help</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </MenubarRoot>
      </div>

      <div className="flex items-center gap-2 text-[13px]">
        <button aria-label="Control Center" className="rounded-md p-1 hover:bg-white/5">
          <Settings className="size-4" />
        </button>
        <button aria-label="Bluetooth" className="rounded-md p-1 hover:bg-white/5">
          <Bluetooth className="size-4" />
        </button>
        <button aria-label="Wi‑Fi" className="rounded-md p-1 hover:bg-white/5">
          <WifiIcon />
        </button>
        <button
          aria-label="Search"
          className="rounded-md p-1 hover:bg-white/5"
          onClick={() => window.dispatchEvent(new Event('ky-open-raycast'))}
        >
          <Search className="size-4" />
        </button>
        <button aria-label="Sound" className="rounded-md p-1 hover:bg-white/5">
          <Volume2 className="size-4" />
        </button>
        <button aria-label="Notifications" className="rounded-md p-1 hover:bg-white/5">
          <Bell className="size-4" />
        </button>
        <div className="flex items-center gap-1 rounded-md px-1.5 py-0.5 bg-white/0">
          {isCharging ? (
            <BatteryCharging className="size-4" />
          ) : batteryLevel > 0.95 ? (
            <BatteryFull className="size-4" />
          ) : (
            <BatteryMedium className="size-4" />
          )}
          <span className="tabular-nums text-xs">
            {Math.round(batteryLevel * 100)}%
          </span>
        </div>
        <div className="min-w-[12rem] text-right tabular-nums" suppressHydrationWarning>
          {formatTime(now)}
        </div>
      </div>
      {showAbout && <AboutThisMac onClose={() => setShowAbout(false)} />}
      {showSettings && <SystemSettings onClose={() => setShowSettings(false)} />}
    </div>
  )
}

export default MacOSMenubar


