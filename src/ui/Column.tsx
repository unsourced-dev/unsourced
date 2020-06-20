import "./Column.css"

import cc from "classnames"
import React from "react"

export type Align = "left" | "center" | "right" | "stretch"
export type VAlign = "top" | "center" | "bottom" | "space-between" | "space-around"
export type Space = "1" | "2" | "4" | "6" | "8" | "12" | "16"

const VALIGN_CLASSES = {
  top: "justify-start",
  center: "justify-center",
  bottom: "justify-end",
  "space-between": "justify-between",
  "space-around": "justify-around",
}

const ALIGN_CLASSES = {
  left: "items-start",
  center: "items-center",
  right: "items-end",
  stretch: "items-stretch",
}

const SPACING_CLASSES = {
  "1": "space-v-1",
  "2": "space-v-2",
  "4": "space-v-4",
  "6": "space-v-6",
  "8": "space-v-8",
  "12": "space-v-12",
  "16": "space-v-16",
}

export interface ColumnProps {
  className?: string
  align?: Align
  valign?: VAlign
  space?: Space
  children?: any
  reverse?: boolean
  title?: string
}

export function Column(props: ColumnProps) {
  const { align, valign, space, reverse, children, title } = props

  const className = cc(
    "flex",
    reverse ? "flex-col-reverse" : "flex-col",
    align && ALIGN_CLASSES[align],
    valign && VALIGN_CLASSES[valign],
    space && SPACING_CLASSES[space],
    props.className
  )

  return (
    <div className={className} title={title}>
      {children}
    </div>
  )
}
