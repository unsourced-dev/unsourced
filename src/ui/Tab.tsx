import cc from "classnames"
import React from "react"

import { useTabsFromContext } from "./Tabs"
import { useTheme } from "./Theme"

export interface TabProps {
  name: string
  label?: string
  disabled?: boolean
  className?: string
  children?: any
}

export function Tab(props: TabProps) {
  const { name, label, disabled, children } = props
  const tabs = useTabsFromContext()
  const theme = useTheme()

  const selected = tabs.tab === name
  const className = cc(
    props.className,
    theme.tabs.all,
    selected
      ? disabled
        ? theme.tabs.selectedDisabled
        : theme.tabs.selected
      : disabled
      ? theme.tabs.disabled
      : theme.tabs.unselected
  )
  return (
    <button onClick={() => tabs.setTab(name)} className={className} disabled={disabled} type="button">
      {children || label || name}
    </button>
  )
}
