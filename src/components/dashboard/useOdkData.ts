"use client"

import { useEffect, useState } from "react"

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

  useEffect(() => {
    if (!url) return
    const cached = cache.get(url)
    if (cached && Date.now() - cached.ts < CACHE_TTL) return

    let cancelled = false
    const ctrl = new AbortController()
    fetch(url, { signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((json) => {
        cache.set(url, { data: json, ts: Date.now() })
        if (!cancelled) {
          setData(json as T)
          setError(null)
          setLoading(false)
        }
      })
      .catch((e) => {
        if (!cancelled && (e as Error)?.name !== "AbortError") {
          setError(e instanceof Error ? e.message : "Erro ao carregar")
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
      ctrl.abort()
    }
  }, [url])

  return { data, loading, error }
}

export function useOdkData<T>(view: string, projectId?: number) {
  const params = new URLSearchParams({ view })
  if (projectId) params.set("projeto", String(projectId))
  return useAsync<T>(`/api/odk/stats?${params.toString()}`)
}
