import "./LoadingBar.css"

import React from "react"

import { useLogger } from "../logger/useLogger"

export interface LoadingBarProps {
  className?: string
}

export function LoadingBar(props: LoadingBarProps) {
  const { className = "bg-blue-600" } = props
  const logger = useLogger()
  if (!logger.loading) {
    return <div />
  }

  return (
    <div className="loading-bar">
      <div className={"loading-bar-content " + className} />
    </div>
  )
}
