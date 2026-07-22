import { log } from "./logger"

const cache = new Map<string, { data: unknown; timestamp: number }>()
const TTL = 6 * 60 * 60 * 1000

export function getCached(path: string): unknown | null {
  const entry = cache.get(path)
  if (!entry) {
    log("cache", "MISS", path)
    return null
  }
  if (Date.now() - entry.timestamp > TTL) {
    cache.delete(path)
    log("cache", "EXPIRED", path)
    return null
  }
  log("cache", "HIT", path)
  return entry.data
}

export function setCache(path: string, data: unknown): void {
  cache.set(path, { data, timestamp: Date.now() })
  log("cache", "SET", path)
}
