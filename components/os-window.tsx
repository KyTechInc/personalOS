/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <explanation> */
/** biome-ignore-all lint/a11y/noSvgWithoutTitle: <explanation> */
/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { useWindowManager } from '@/components/window-manager'

interface WindowPosition { x: number; y: number }
interface WindowSize { width: number; height: number }

interface OSWindowProps {
  title: string
  initialPosition?: WindowPosition
  initialSize?: WindowSize
  /** Controlled position. When provided, the window becomes position-controlled. */
  position?: WindowPosition
  /** Controlled size. When provided, the window becomes size-controlled. */
  size?: WindowSize
  /** Called when the position changes via dragging */
  onPositionChange?: (position: WindowPosition) => void
  /** Called when the size changes via resize handle */
  onSizeChange?: (size: WindowSize) => void
  onClose?: () => void
  className?: string
  children: React.ReactNode
  storageKey?: string
  /** Tailwind classes for background layer (e.g., "bg-black/60") */
  bgClassName?: string
  /** Whether to apply backdrop blur */
  blur?: boolean
  /** Enable/disable dragging */
  draggable?: boolean
  /** Enable/disable resizing */
  resizable?: boolean
  /** Edge snap threshold in pixels */
  snapThreshold?: number
}

export default function OSWindow({
  title,
  initialPosition = { x: 170, y: 60 },
  initialSize = { width: 1400, height: 800 },
  position: positionProp,
  size: sizeProp,
  onPositionChange,
  onSizeChange,
  onClose,
  className,
  children,
  storageKey,
  bgClassName = 'bg-black/80',
  blur = true,
  draggable = true,
  resizable = true,
  snapThreshold = 24,
}: OSWindowProps) {
  const { register, unregister, bringToFront, getZIndex } = useWindowManager()
  const idRef = useRef<string>('')
  if (!idRef.current) idRef.current = `win-${Math.random().toString(36).slice(2)}`
  const id = idRef.current
  const [position, setPosition] = useState<WindowPosition>(positionProp ?? initialPosition)
  const [size, setSize] = useState<WindowSize>(sizeProp ?? initialSize)
  const [focused, setFocused] = useState<boolean>(true)
  const draggingRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null)
  const resizingRef = useRef<{ startX: number; startY: number; origW: number; origH: number } | null>(null)
  const positionRef = useRef<WindowPosition>(initialPosition)
  const sizeRef = useRef<WindowSize>(initialSize)

  useEffect(() => { positionRef.current = position }, [position])
  useEffect(() => { sizeRef.current = size }, [size])

  const clampToViewport = useCallback((x: number, y: number) => {
    if (typeof window === 'undefined') return { x, y }
    const current = sizeProp ?? size
    const maxX = Math.max(0, window.innerWidth - current.width)
    const maxY = Math.max(0, window.innerHeight - current.height)
    return { x: Math.min(Math.max(0, x), maxX), y: Math.min(Math.max(0, y), maxY) }
  }, [size, sizeProp])

  useEffect(() => {
    register(id)
    return () => unregister(id)
  }, [id, register, unregister])

  useEffect(() => {
    // hydrate from storage
    if (!storageKey) return
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (!positionProp && parsed?.position) setPosition(parsed.position)
        if (!sizeProp && parsed?.size) setSize(parsed.size)
      }
    } catch {}
  // run once
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!storageKey) return
    try {
      const pos = positionProp ?? position
      const sz = sizeProp ?? size
      localStorage.setItem(storageKey, JSON.stringify({ position: pos, size: sz }))
    } catch {}
  }, [position, size, storageKey, positionProp, sizeProp])

  useEffect(() => {
    function onMove(e: PointerEvent) {
      if (draggingRef.current && draggable) {
        const { startX, startY, origX, origY } = draggingRef.current
        const nextX = origX + (e.clientX - startX)
        const nextY = origY + (e.clientY - startY)
        const clamped = clampToViewport(nextX, nextY)
        if (positionProp) onPositionChange?.(clamped); else setPosition(clamped)
      }
      if (resizingRef.current && resizable) {
        const { startX, startY, origW, origH } = resizingRef.current
        const nextW = Math.max(480, origW + (e.clientX - startX))
        const nextH = Math.max(320, origH + (e.clientY - startY))
        const nextSize = { width: nextW, height: nextH }
        if (sizeProp) onSizeChange?.(nextSize); else setSize(nextSize)
      }
    }
    function onUp() {
      // snap to edges on release
      if (typeof window !== 'undefined') {
        const threshold = snapThreshold
        const currentSize = sizeRef.current
        const currentPos = positionRef.current
        const maxX = Math.max(0, window.innerWidth - currentSize.width)
        const maxY = Math.max(0, window.innerHeight - currentSize.height)
        let { x, y } = currentPos
        if (x < threshold) x = 0
        if (y < threshold) y = 0
        if (Math.abs(maxX - x) < threshold) x = maxX
        if (Math.abs(maxY - y) < threshold) y = maxY
        if (positionProp) onPositionChange?.({ x, y }); else setPosition({ x, y })
      }
      draggingRef.current = null
      resizingRef.current = null
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [clampToViewport, draggable, onPositionChange, onSizeChange, positionProp, resizable, sizeProp, snapThreshold])

  const headerRef = useRef<HTMLDivElement | null>(null)
  const onDragStart = useCallback((e: React.PointerEvent) => {
    // Only drag with primary button and when target is header area
    if (e.button !== 0) return
    if (!headerRef.current) return
    setFocused(true)
    if (draggable) {
      const pos = positionProp ?? position
      draggingRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y }
    }
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }, [position, positionProp, draggable])

  const onResizeStart = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return
    if (resizable) {
      const sz = sizeProp ?? size
      resizingRef.current = { startX: e.clientX, startY: e.clientY, origW: sz.width, origH: sz.height }
    }
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }, [size, sizeProp, resizable])

  return (
    <div
      className={cn('fixed z-40 select-none', className)}
      style={{ left: (positionProp ?? position).x, top: (positionProp ?? position).y, width: (sizeProp ?? size).width, height: (sizeProp ?? size).height, zIndex: getZIndex(id) }}
      onPointerDown={() => { setFocused(true); bringToFront(id) }}
    >
      <div className={cn('flex h-full w-full flex-col overflow-hidden rounded-2xl border shadow-2xl', blur ? 'backdrop-blur-lg' : '', bgClassName, focused ? 'border-white/20 ring-1 ring-white/15' : 'border-white/10')}>
        <div
          ref={headerRef}
          onPointerDown={onDragStart}
          className="flex cursor-grab items-center gap-2 border-b border-white/10 bg-background/70 px-3 py-2"
        >
          <div className="flex items-center gap-2 pr-2">
            <button 
              aria-label="Close" 
              className="group relative size-3.5 rounded-full bg-[#ff5f57] hover:bg-[#ff4136] transition-colors" 
              onClick={onClose}
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg width="8" height="8" viewBox="0 0 8 8" className="text-black/60">
                  <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                </svg>
              </div>
            </button>
            <button 
              aria-label="Minimize" 
              className="group relative size-3.5 rounded-full bg-[#febc2e] hover:bg-[#f5a623] transition-colors"
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg width="8" height="8" viewBox="0 0 8 8" className="text-black/60">
                  <path d="M2 4h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                </svg>
              </div>
            </button>
            <button 
              aria-label="Maximize" 
              className="group relative size-3.5 rounded-full bg-[#28c840] hover:bg-[#25b83a] transition-colors"
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg width="8" height="8" viewBox="0 0 8 8" className="text-black/60">
                  <path d="M2 2l4 4M6 2L2 6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                </svg>
              </div>
            </button>
          </div>
          <div className="truncate text-[13px] text-white/80">{title}</div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">{children}</div>

        {resizable && (
          <div
            onPointerDown={onResizeStart}
            className="absolute bottom-1 right-1 size-4 cursor-se-resize rounded-sm border border-white/10 bg-white/10"
          />
        )}
      </div>
    </div>
  )
}


