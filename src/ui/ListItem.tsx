import cc from "classnames"
import React from "react"

export interface ListItemProps {
  className?: string
  children?: any
}

export function ListItem(props: ListItemProps) {
  const { children } = props
  const className = cc("mb-2 list-inside", props.className)
  return <li className={className}>{children}</li>
}
