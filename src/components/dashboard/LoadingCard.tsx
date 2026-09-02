"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RotateCw } from "lucide-react"

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

interface ErrorCardProps {
  label?: string
  message?: string | null
  onRetry?: () => void
  height?: number
}

export function ErrorCard({ label = "Não foi possível carregar", message, onRetry, height = 300 }: ErrorCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div
          className="flex flex-col items-center justify-center gap-3 text-center"
          style={{ minHeight: height }}
        >
          <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden />
          <div>
            <p className="text-sm font-medium">{label}</p>
            {message && <p className="mt-1 text-xs text-muted-foreground">{message}</p>}
          </div>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RotateCw className="h-3.5 w-3.5 mr-1.5" aria-hidden />
              Tentar novamente
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function KpiCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="flex flex-col items-center gap-2 pt-5 text-center">
            <div className="h-12 w-12 rounded-xl bg-muted" />
            <div className="h-6 w-16 rounded bg-muted" />
            <div className="h-3 w-20 rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
