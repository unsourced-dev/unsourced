import fb from "firebase/app"

export function isFirebaseInitialized(): boolean {
  return fb.apps.length > 0
}
