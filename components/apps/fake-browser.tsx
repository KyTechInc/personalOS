/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
'use client'

import React, { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, RefreshCw, X, Plus } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import OSWindow from '@/components/os-window'

interface AllowedSite {
  id: string
  title: string
  url: string
  icon?: string
}

interface BrowserTab {
  id: string
  siteId: string
}

interface FakeBrowserProps {
  sites: AllowedSite[]
  onClose?: () => void
}

function getInitialTabs(sites: AllowedSite[]): BrowserTab[] {
  const first = sites[0]
  if (!first) return []
  return [{ id: `tab-${first.id}`, siteId: first.id }]
}

export default function FakeBrowser({ sites, onClose }: FakeBrowserProps) {
  const siteIdToSite = useMemo(() => new Map(sites.map(s => [s.id, s])), [sites])
  const [tabs, setTabs] = useState<BrowserTab[]>(() => getInitialTabs(sites))
  const [activeTabId, setActiveTabId] = useState<string>(() => tabs[0]?.id ?? '')
  const activeTab = tabs.find(t => t.id === activeTabId)
  const activeSite = activeTab ? siteIdToSite.get(activeTab.siteId) : undefined

  function openSite(siteId: string) {
    const newTab: BrowserTab = { id: `tab-${siteId}-${Date.now()}`, siteId }
    setTabs(prev => [...prev, newTab])
    setActiveTabId(newTab.id)
  }

  function closeTab(tabId: string) {
    setTabs(prev => prev.filter(t => t.id !== tabId))
    if (tabId === activeTabId) {
      const next = tabs.find(t => t.id !== tabId)
      setActiveTabId(next?.id ?? '')
    }
  }

  function navigate(offset: number) {
    if (!activeTab) return
    const currentIndex = sites.findIndex(s => s.id === activeTab.siteId)
    const nextIndex = Math.max(0, Math.min(sites.length - 1, currentIndex + offset))
    const nextSite = sites[nextIndex]
    if (!nextSite) return
    setTabs(prev => prev.map(t => (t.id === activeTab.id ? { ...t, siteId: nextSite.id } : t)))
  }

  return (
    <OSWindow title={activeSite?.title ?? 'Browser'} onClose={onClose} storageKey="window-browser">
      {/* URL bar */}
      <div className="flex items-center gap-2 border-b border-white/10 bg-black/30 px-3 py-2">
        <div className="flex items-center gap-1">
          <button aria-label="Back" className="rounded-md p-1 hover:bg-white/10" onClick={() => navigate(-1)}>
            <ChevronLeft className="size-4" />
          </button>
          <button aria-label="Forward" className="rounded-md p-1 hover:bg-white/10" onClick={() => navigate(1)}>
            <ChevronRight className="size-4" />
          </button>
          <button aria-label="Refresh" className="rounded-md p-1 hover:bg-white/10" onClick={() => setActiveTabId(v => v)}>
            <RefreshCw className="size-4" />
          </button>
        </div>

        <input
          value={activeSite?.url ?? ''}
          onChange={() => {}}
          readOnly
          className="ml-2 flex-1 truncate rounded-md border border-white/10 bg-black/20 px-3 py-1 text-[13px] text-white/80 outline-none"
        />

        <button
          aria-label="New tab"
          className="ml-2 rounded-md p-1 hover:bg-white/10"
          onClick={() => openSite(sites[0]?.id ?? '')}
        >
          <Plus className="size-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10 bg-black/20 px-2 py-1">
        <Tabs value={activeTabId} onValueChange={setActiveTabId}>
          <TabsList className="bg-transparent p-0">
            {tabs.map(tab => {
              const site = siteIdToSite.get(tab.siteId)
              return (
                <div key={tab.id} className="mr-1 inline-flex items-center">
                  <TabsTrigger value={tab.id} className="rounded-md bg-white/5 px-2 py-1 text-[12px] hover:bg-white/10 data-[state=active]:bg-white/10">
                    {site?.title ?? 'Tab'}
                  </TabsTrigger>
                  <button aria-label="Close tab" className="ml-1 rounded p-1 hover:bg-white/10" onClick={() => closeTab(tab.id)}>
                    <X className="size-3.5" />
                  </button>
                </div>
              )
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="relative flex-1">
        {activeSite ? (
          <iframe
            key={`${activeTabId}-${activeSite.id}`}
            title={activeSite.title}
            src={activeSite.url}
            className="h-full w-full bg-black"
            referrerPolicy="no-referrer"
            loading="lazy"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            allow="clipboard-read; clipboard-write; autoplay; encrypted-media; picture-in-picture"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-white/70">No tab</div>
        )}
      </div>

      {/* Site picker */}
      <div className="border-t border-white/10 bg-black/30 px-2 py-1 text-[12px]">
        <div className="flex flex-wrap items-center gap-1">
          {sites.map(site => (
            <button
              key={site.id}
              onClick={() => activeTab && setTabs(prev => prev.map(t => (t.id === activeTab.id ? { ...t, siteId: site.id } : t)))}
              className="rounded-md bg-white/5 px-2 py-1 text-white/80 hover:bg-white/10"
            >
              {site.title}
            </button>
          ))}
        </div>
      </div>
    </OSWindow>
  )
}


