import firebase from "firebase/app"
import "firebase/storage"

import { useEffect, useState } from "react"

// not used at the moment

// See https://firebase.google.com/docs/storage/web/download-files

export interface FileHook {
  exists: boolean
  loading: boolean
  error: string | undefined
  downloadUrl: string
  put(data: Blob | Uint8Array | ArrayBuffer, metadata?: firebase.storage.UploadMetadata): Promise<void>
}

export function useFile(filename: string): FileHook {
  const [exists, setExists] = useState(false)
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)
  const ref = firebase.storage().ref(filename)

  useEffect(() => {
    setLoading(true)
    setError(undefined)
    setExists(false)
    ref
      .getDownloadURL()
      .then((url) => {
        setDownloadUrl(url)
        setLoading(false)
        setExists(true)
      })
      .catch((err) => {
        if (err.code_ === "storage/object-not-found") {
          setLoading(false)
          return
        }
        setError(err.message || err)
        setLoading(false)
      })
  }, [filename])

  async function put(data: Blob | Uint8Array | ArrayBuffer, metadata?: firebase.storage.UploadMetadata) {
    setLoading(true)
    setError(undefined)
    try {
      ref.put(data, metadata)
      setLoading(false)
    } catch (err) {
      setError(err.message || err)
      setLoading(false)
    }
  }

  return {
    exists,
    error,
    loading,
    downloadUrl,
    put,
  }
}
