import { MediaDef } from "../ui/Media"

export function getAvatarUrl(media: MediaDef): string {
  const item = media && media[0]
  if (!item) return null

  if (item.srcSet) {
    for (let i = item.srcSet.length - 1; i >= 0; i--) {
      const last = item.srcSet[i]
      if (last.url) return last.url
    }
  }

  if (item.src && item.src.url) return item.src.url

  return null
}
