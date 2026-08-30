"use client"

import { Card, CardContent } from "@/components/ui/card"

interface LoadingCardProps {
  height?: number
  label?: string
}

export function LoadingCard({ height = 300, label = "Carregando..." }: LoadingCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-40 rounded bg-muted" />
          <div
            className="flex items-center justify-center rounded-md bg-muted/50 text-sm text-muted-foreground"
            style={{ height }}
          >
            {label}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function KpiCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4 flex flex-col items-center text-center gap-2">
            <div className="h-7 w-7 rounded-full bg-muted" />
            <div className="h-6 w-16 rounded bg-muted" />
            <div className="h-3 w-20 rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
