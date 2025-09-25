'use client'

import React from 'react'

interface WindowManagerContextValue {
  order: string[]
  focusedId: string | null
  register: (id: string) => void
  unregister: (id: string) => void
  bringToFront: (id: string) => void
  getZIndex: (id: string) => number
}

const WindowManagerContext = React.createContext<WindowManagerContextValue | null>(null)

export function useWindowManager() {
  const ctx = React.useContext(WindowManagerContext)
  if (!ctx) throw new Error('useWindowManager must be used within WindowManagerProvider')
  return ctx
}

export function WindowManagerProvider({ children }: { children: React.ReactNode }) {
  const [order, setOrder] = React.useState<string[]>([])

  const register = React.useCallback((id: string) => {
    setOrder(prev => (prev.includes(id) ? prev : [...prev, id]))
  }, [])

  const unregister = React.useCallback((id: string) => {
    setOrder(prev => prev.filter(x => x !== id))
  }, [])

  const bringToFront = React.useCallback((id: string) => {
    setOrder(prev => {
      const without = prev.filter(x => x !== id)
      return [...without, id]
    })
  }, [])

  const getZIndex = React.useCallback((id: string) => {
    const index = order.indexOf(id)
    return 100 + (index === -1 ? 0 : index)
  }, [order])

  const value: WindowManagerContextValue = React.useMemo(
    () => ({ order, focusedId: order[order.length - 1] ?? null, register, unregister, bringToFront, getZIndex }),
    [order, register, unregister, bringToFront, getZIndex]
  )

  return <WindowManagerContext.Provider value={value}>{children}</WindowManagerContext.Provider>
}


