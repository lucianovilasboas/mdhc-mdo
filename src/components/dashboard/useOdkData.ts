"use client"

import { useCallback, useEffect, useState } from "react"

const CACHE_TTL = 5 * 60 * 1000
const cache = new Map<string, { data: unknown; ts: number }>()

function readCache<T>(url: string | null): { data: T | null; fresh: boolean } {
  if (!url) return { data: null, fresh: false }
  const entry = cache.get(url)
  if (entry && Date.now() - entry.ts < CACHE_TTL) {
    return { data: entry.data as T, fresh: true }
  }
  return { data: null, fresh: false }
}

export function useAsync<T>(url: string | null) {
  const initial = readCache<T>(url)
  const [data, setData] = useState<T | null>(initial.data)
  const [loading, setLoading] = useState(url !== null && !initial.fresh)
  const [error, setError] = useState<string | null>(null)

  const carregar = useCallback(
    async (force = false) => {
      if (!url) return
      if (!force) {
        const cached = cache.get(url)
        if (cached && Date.now() - cached.ts < CACHE_TTL) return
      }
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(url, { cache: "no-store" })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        cache.set(url, { data: json, ts: Date.now() })
        setData(json as T)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar")
      } finally {
        setLoading(false)
      }
    },
    [url],
  )

  useEffect(() => {
    // Deferido 1 tick: o carregamento é assíncrono e dispara setState;
    // chamá-lo síncrono no corpo do effect viola react-hooks/set-state-in-effect.
    const timer = setTimeout(() => carregar(), 0)
    return () => clearTimeout(timer)
  }, [carregar])

  return { data, loading, error, recarregar: () => carregar(true) }
}

export function useOdkData<T>(view: string, projectId?: number) {
  const params = new URLSearchParams({ view })
  if (projectId) params.set("projeto", String(projectId))
  return useAsync<T>(`/api/odk/stats?${params.toString()}`)
}