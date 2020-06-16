import "./Notifications.css"

import React from "react"

import { Notification, useLogger } from "../logger/useLogger"
import { Column } from "./Column"

function getClassName(notification: Notification) {
  switch (notification.type) {
    case "error":
      return "bg-red-200 text-bold w-64 h-8 p-2"
    case "info":
      return "bg-green-200 text-bold w-64 h-8 p-2"
  }
}

interface SingleNotificationProps {
  notification: Notification
}

function SingleNotification(props: SingleNotificationProps) {
  const { notification } = props
  return <div className={getClassName(notification)}>{notification.text}</div>
}

export interface NotificationsProps {
  // nothing for now
}

export function Notifications(props: NotificationsProps) {
  const logger = useLogger()

  return (
    <Column align="center" reverse className="fixed bottom-0 left-40 max-w-content">
      {logger.notifications.map((n, i) => (
        <SingleNotification notification={n} key={i} />
      ))}
    </Column>
  )
}
