import firebase from "firebase/compat/app"
import "firebase/compat/storage"

/**
 * Delete the file at the given path.
 */
export async function deleteFile(path: string) {
  if (!path) return
  try {
    const ref = firebase.storage().ref(path)
    await ref.delete()
  } catch (_) {
    // swallow the error
  }
}

export function deleteFiles(paths: string[]): Promise<any> {
  return Promise.all(paths.map(deleteFile))
}
