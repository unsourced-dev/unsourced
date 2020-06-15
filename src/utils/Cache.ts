import { StringMap } from "../types"

export interface CacheOptions {
  enabled: boolean
  clientSideOnly: boolean
  /** The maximum amount of time documents can stay in the cache, defaults to 5 minutes, < 0 for no limit. */
  maxTimeMs?: number
}

export interface CacheItem {
  time: number
  value: any
}

// 5 minutes
const MAX_CACHE_TIME_MS = 5 * 60 * 1000

export class Cache {
  private data: StringMap<CacheItem> = {}
  constructor(private options: CacheOptions) {}

  set(path: string, value: any) {
    if (!this.options.enabled) return
    if (this.options.clientSideOnly && typeof window === undefined) return

    this.data[path] = { time: Date.now(), value }
  }

  get(path: string) {
    const item = this.data[path]
    if (!item) return undefined
    const maxTime = this.options.maxTimeMs || MAX_CACHE_TIME_MS
    if (maxTime > 0 && Date.now() - item.time > maxTime) {
      delete this.data[path]
      return undefined
    }
    return item.value
  }

  delete(path: string) {
    if (this.data[path]) {
      delete this.data[path]
    }
  }
}
