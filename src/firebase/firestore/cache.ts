import { Cache } from "../../utils/Cache"

const CACHE = new Cache({ enabled: true, clientSideOnly: true })

export function setInCache(path: string, value: any) {
  CACHE.set(path, value)
}

export function getFromCache(path: string): any {
  return CACHE.get(path)
}

export function deleteInCache(path: string) {
  CACHE.delete(path)
}
