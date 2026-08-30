"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

export interface TabItem {
  id: string
  label: string
  href: string
}

interface TabsProps {
  items: TabItem[]
  active: string
}

export function Tabs({ items, active }: TabsProps) {
  return (
    <nav className="flex gap-1 overflow-x-auto border-b" aria-label="Seções do dashboard">
      {items.map((t) => (
        <Link
          key={t.id}
          href={t.href}
          aria-current={active === t.id ? "page" : undefined}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-t-md border-b-2 -mb-px whitespace-nowrap transition-colors",
            active === t.id
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  )
}
