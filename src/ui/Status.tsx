import React from "react"

import { Heading } from "./Heading"

export interface HookWithStatus {
  error?: string
  loading?: boolean
}

export interface StatusProps {
  className?: string
  data: HookWithStatus
}

export function Status(props: StatusProps) {
  const { className, data } = props

  if (data.error) {
    return (
      <div className={className}>
        <Heading level="1">Error!</Heading>
        <p>{data.error}</p>
      </div>
    )
  }

  return <div />
}
