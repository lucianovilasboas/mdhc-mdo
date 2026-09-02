"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

export interface TabItem {
  id: string
  label: string
  href: string
  icon?: LucideIcon
  accent?: string
}

interface TabsProps {
  items: TabItem[]
  active: string
}

export function Tabs({ items, active }: TabsProps) {
  return (
    <nav className="flex gap-1 overflow-x-auto overflow-y-hidden border-b" aria-label="Seções do dashboard">
      {items.map((t) => {
        const Icon = t.icon
        const isActive = active === t.id
        return (
          <Link
            key={t.id}
            href={t.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-t-md border-b-2 -mb-px whitespace-nowrap transition-colors",
              isActive
                ? "text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
            style={isActive && t.accent ? { borderColor: t.accent } : undefined}
          >
            {Icon && (
              <Icon
                className="h-4 w-4 shrink-0"
                style={isActive && t.accent ? { color: t.accent } : undefined}
                aria-hidden
              />
            )}
            {t.label}
          </Link>
        )
      })}
    </nav>
  )
}
