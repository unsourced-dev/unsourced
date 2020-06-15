import cc from "classnames"
import React from "react"

import { useTheme } from "./Theme"

export type HeadingLevel = "1" | "2" | "3" | "4" | "5" | "6" | number

export interface HeadingProps {
  level?: HeadingLevel
  unstyled?: boolean
  className?: string
  children?: any
  id?: string
}

export function Heading(props: HeadingProps) {
  const { unstyled, children } = props
  const Tag: any = "h" + String(props.level || "1")
  const theme = useTheme()

  if (unstyled) {
    return (
      <Tag id={props.id} className={props.className}>
        {children}
      </Tag>
    )
  }

  const className = cc(theme.heading[Tag], props.className)

  return (
    <Tag id={props.id} className={className}>
      {children}
    </Tag>
  )
}
