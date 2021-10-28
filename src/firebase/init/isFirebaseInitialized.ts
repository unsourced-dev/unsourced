import fb from "firebase/compat/app"

export function isFirebaseInitialized(): boolean {
  return fb.apps.length > 0
}
