import { config } from "../config"
import { FirestoreDatabase } from "./FirestoreDatabase"

// export const firestore = new FirestoreDatabase(env.FIREBASE_CONFIG)
let _firestore: FirestoreDatabase

export function firestore() {
  if (!_firestore) {
    _firestore = new FirestoreDatabase(config())
  }
  return _firestore
}
