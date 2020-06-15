import eq from "fast-deep-equal"
import { useEffect, useState } from "react"

import { getFromCache } from "../../cache"
import { firestore } from "../../firestore"

export function useValue<T>(path: string, values?: T): T {
  const [result, setResult] = useState<T>(getFromCache(path) || values)

  async function fetchStuff() {
    try {
      const doc = await firestore().get<T>(path)
      if (!doc) return

      delete doc.___doc___
      if (!eq(doc, result)) {
        setResult(doc)
      }
    } catch (err) {
      console.error("Error while fetching document at " + path, err)
    }
  }

  useEffect(() => {
    fetchStuff()
  }, [path])

  return result
}
