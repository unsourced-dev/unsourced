import "./Row.css"

import cc from "classnames"
import React from "react"

export type Align = "left" | "center" | "right" | "space-between" | "space-around"
export type VAlign = "top" | "center" | "bottom" | "stretch"
export type Space = "1" | "2" | "4" | "6" | "8" | "12" | "16"

const ALIGN_CLASSES = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
  "space-between": "justify-between",
  "space-around": "justify-around",
}

const VALIGN_CLASSES = {
  top: "items-start",
  center: "items-center",
  bottom: "items-end",
  stretch: "items-stretch",
}

const SPACING_CLASSES = {
  "1": "space-h-1",
  "2": "space-h-2",
  "4": "space-h-4",
  "6": "space-h-6",
  "8": "space-h-8",
  "12": "space-h-12",
  "16": "space-h-16",
}

export interface RowProps {
  className?: string
  children?: any
  align?: Align
  valign?: VAlign
  space?: Space
  /** Does not work well with space. */
  wrap?: boolean
  reverse?: boolean
}

export function Row(props: RowProps) {
  const { align, valign, wrap, space, reverse, children } = props

  const className = cc(
    "flex ",
    reverse && "flex-row-reverse",
    align && ALIGN_CLASSES[align],
    valign && VALIGN_CLASSES[valign],
    space && SPACING_CLASSES[space],
    wrap && "flex-wrap",
    props.className
  )

  return <div className={className}>{children}</div>
}
