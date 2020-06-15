import { MediaDef } from "../ui/Media"

export function getCardPictureUrl(media: MediaDef): string {
  const item = media && media[0]
  if (!item) return null

  let result = item.src && item.src.url
  if (item.srcSet) {
    for (let i = item.srcSet.length - 1; i >= 0; i--) {
      const last = item.srcSet[i]
      if (!last.url) continue
      if (last.height) {
        if (last.width >= 800 && last.height >= 800) {
          result = last.url
        }
      } else if (last.width >= 1000) {
        result = last.url
      }
    }
  }

  return result || null
}
