import cc from "classnames"
import React from "react"

export interface SvgProps {
  width: string | number
  height: string | number
  viewBox?: string
  fillCurrent?: boolean
  strokeCurrent?: boolean
  className?: string
  children?: any
  style?: any
}

export function Svg(props: SvgProps) {
  const { width, height, fillCurrent, strokeCurrent, children, style } = props
  const className = cc(
    {
      "fill-current": fillCurrent,
      "stroke-current": strokeCurrent,
    },
    props.className
  )
  const formattedWidth = String(width)
  const formattedHeight = String(height)
  const viewBox = props.viewBox || `0 0 ${width} ${height}`
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      viewBox={viewBox}
      width={formattedWidth}
      height={formattedHeight}
      style={style}
    >
      {children}
    </svg>
  )
}
