"use client"

import { useEffect, useState } from "react"

export function useAsync<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(url !== null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!url) return
    let cancelled = false
    const ctrl = new AbortController()
    fetch(url, { signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((json) => {
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
