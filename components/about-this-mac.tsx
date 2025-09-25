'use client'

import React from 'react'
import OSWindow from '@/components/os-window'
import Image from 'next/image'

interface AboutThisMacProps {
  onClose: () => void
}

export default function AboutThisMac({ onClose }: AboutThisMacProps) {
  return (
    <OSWindow
      title="About This Mac"
      onClose={onClose}
      storageKey="window-about"
      initialSize={{ width: 420, height: 560 }}
      initialPosition={{ x: 240, y: 120 }}
      bgClassName="bg-black/85"
      blur
      resizable={false}
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center font-mono">
        <div className='size-24 rounded-lg overflow-hidden'>
        <Image src="/headshot.webp" alt="Logo" width={150} height={150} className="size-full object-cover" />
        </div>
        <div className="text-2xl font-semibold">KyOS</div>
        <div className="text-[13px] text-white/70">Version 33.0</div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-left text-[13px] text-white/85">
          <div>Model Name</div>
          <div>Kyle McCracken</div>
          <div>Chip</div>
          <div>IT Specialist & Full Stack Developer</div>
          <div>Memory</div>
          <div>15 Years Exp</div>
          <div>Serial number</div>
          <div>L9JHP4CRX2</div>
        </div>
      </div>
    </OSWindow>
  )
}


