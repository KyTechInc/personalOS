"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root data-slot="tabs" className={cn("w-full", className)} {...props} />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List data-slot="tabs-list" className={cn("inline-flex h-8 items-center gap-1", className)} {...props} />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger data-slot="tabs-trigger" className={cn("data-[state=active]:bg-white/10 inline-flex items-center justify-center rounded-md bg-white/5 px-2 py-1 text-[12px] outline-hidden transition hover:bg-white/10", className)} {...props} />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content data-slot="tabs-content" className={cn("mt-2", className)} {...props} />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
