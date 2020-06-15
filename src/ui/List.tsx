import cc from "classnames"
import React from "react"

export interface ListProps {
  ordered?: boolean
  className?: string
  children?: any
  style?: any
}

export function List(props: ListProps) {
  const { ordered, style, children } = props
  const className = cc("mb-4" + ordered ? "" : "list-decimal", props.className)
  if (ordered) {
    return (
      <ol className={className} style={style}>
        {children}
      </ol>
    )
  }
  return (
    <ul className={className} style={style}>
      {children}
    </ul>
  )
}
