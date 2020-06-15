import { useState } from "react"
import { createContainer } from "unstated-next"

import { guid } from "./guid"

export interface Notification {
  text: string
  type: "info" | "error"
}

export interface LoggerHook {
  loading: boolean
  setLoading(loading: boolean): void
  notifications: Notification[]
  addNotification(notification: Notification)
}

function _useLogger() {
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])

  return {
    loading,
    setLoading,
    notifications,
    addNotification(notification: Notification) {
      const id = guid()
      notification["_id"] = id
      setNotifications((n) => n.concat(notification))
      setTimeout(() => {
        setNotifications((n) => n.filter((not) => not["_id"] !== id))
      }, 2000)
    },
  }
}

const Logger = createContainer<LoggerHook>(_useLogger)

export const useLogger = Logger.useContainer

export const LoggerProvider = Logger.Provider
