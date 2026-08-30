"use client"

import { useSyncExternalStore } from "react"

/**
 * Observa uma media query com `useSyncExternalStore`.
 * Evita o anti-pattern de `setState` síncrono dentro de `useEffect`
 * (regra react-hooks/set-state-in-effect).
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => {
      const mq = window.matchMedia(query)
      mq.addEventListener("change", callback)
      return () => mq.removeEventListener("change", callback)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}