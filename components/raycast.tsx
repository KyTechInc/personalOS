/** biome-ignore-all lint/correctness/noEmptyPattern: <explanation> */
'use client'

import React from 'react'
import { Command } from 'cmdk'
import { Command as UICommand, CommandDialog as UICommandDialog } from '@/components/ui/command'
import Image from 'next/image'

interface RaycastProps {
  className?: string
}

export default function Raycast({}: RaycastProps) {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    function down(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(prev => !prev)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    function openEvent() {
      setOpen(true)
    }
    window.addEventListener('keydown', down)
    window.addEventListener('ky-open-raycast', openEvent as EventListener)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('ky-open-raycast', openEvent as EventListener)
    }
  }, [])

  return (
    <div className="raycast" ref={containerRef}>
      <UICommandDialog
        title="Raycast"
        description=""
        open={open}
        onOpenChange={setOpen}
        showCloseButton={false}
      >
        <UICommand className="raycast">
          <Command.Input placeholder="Search commands…" />
          <div cmdk-raycast-top-shine="" />
          <Command.List>
            <Command.Empty>No results found.</Command.Empty>

            <Command.Group heading="Favorites">
              <Command.Item keywords={["open", "apps"]}>Open Applications</Command.Item>
              <Command.Item keywords={["files", "search"]}>Search Files</Command.Item>
              <Command.Item keywords={["web", "google"]}>Search Google</Command.Item>
            </Command.Group>

            <Command.Separator cmdk-raycast-loader="" />

            <Command.Group heading="System">
              <Command.Item keywords={["wifi", "network"]}>Toggle Wi‑Fi</Command.Item>
              <Command.Item keywords={["bt", "bluetooth"]}>Toggle Bluetooth</Command.Item>
              <Command.Item keywords={["dark", "appearance"]}>Toggle Dark Mode</Command.Item>
            </Command.Group>

            <Command.Group heading="Navigation">
              <Command.Item keywords={["home", "desktop"]}>Go to Desktop</Command.Item>
              <Command.Item keywords={["about", "profile"]}>Open About</Command.Item>
              <Command.Item keywords={["settings", "preferences"]}>Open Settings</Command.Item>
            </Command.Group>
          </Command.List>

          <div cmdk-raycast-footer="">
            <Image src="/raycast.svg" alt="Raycast" width={25} height={25} />
            <hr />
            <div cmdk-raycast-open-trigger="">
              Open with
              <kbd>↵</kbd>
            </div>
            <div cmdk-raycast-subcommand-trigger="">
              Actions
              <hr />
              <kbd>⌘</kbd>
              <kbd>K</kbd>
            </div>
          </div>
        </UICommand>
      </UICommandDialog>
    </div>
  )
}


