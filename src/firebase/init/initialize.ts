import app from "firebase/compat/app"

import { FirebaseConfig, setConfig } from "../config"

export function initialize(config: FirebaseConfig) {
  if (!config) {
    throw new Error("No config provided to initialize firebase.")
  }
  if (app.apps.length === 0) {
    try {
      setConfig(config)
      const result = app.initializeApp(config)
      return result
    } catch (err) {
      console.error("Error while initializing firebase app: " + config.projectId, err)
    }
  }
  return app.apps[0]
}
