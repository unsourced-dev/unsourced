export interface FirebaseConfig {
  apiKey: string
  projectId: string
  authDomain?: string
  databaseURL?: string
  storageBucket?: string
  appId?: string
  functionsUrl?: string
}

let _config: FirebaseConfig = null

export function setConfig(config: FirebaseConfig) {
  _config = config
}

export function config() {
  if (!_config) {
    throw new Error("No config set, please call setConfig()")
  }
  return _config
}
