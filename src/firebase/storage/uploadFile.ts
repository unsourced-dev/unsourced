import firebase from "firebase/compat/app"
import "firebase/compat/storage"

import { guid } from "../../utils/guid"

/**
 * Gets the extension of the given file.
 */
function getExtension(file: File): string | null {
  const segments = file.name.split(".")
  if (segments.length <= 1) return null
  return segments[segments.length - 1]
}

/**
 * Generate a name for the given file in the storage.
 */
export function getFilePath(file: File, options: UploadFileOptions): string {
  const { preserve, folder } = options
  const fileName = preserve ? file.name : guid() + "." + getExtension(file)
  const folderName = folder ? (folder.endsWith("/") ? folder : folder + "/") : ""

  return folderName + fileName
}

export interface UploadFileResult {
  url: string
  path: string
}

export interface UploadFileOptions {
  preserve?: boolean
  folder?: string
}

/**
 * upload a file and returns the download URL & path in firebase storage.
 */
export async function uploadFile(file: File, options: UploadFileOptions): Promise<UploadFileResult> {
  const path = getFilePath(file, options)
  const ref = firebase.storage().ref(path)

  await ref.put(file, {
    cacheControl: "public,max-age=31536000",
  })
  return ref.getDownloadURL().then((url) => ({ url, path }))
}

export interface UploadBlobPayload {
  blob: Blob
  path: string
  contentType?: string
}

export async function uploadBlob(payload: UploadBlobPayload) {
  const { blob, path, contentType } = payload
  const ref = firebase.storage().ref(path)

  await ref.put(blob, {
    cacheControl: "public,max-age=31536000",
    contentType,
  })
  return ref.getDownloadURL().then((url) => ({ url, path }))
}
