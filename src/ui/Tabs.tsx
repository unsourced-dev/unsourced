import React from "react"

export const TabsContext = React.createContext<TabsHook>(null)

export function useTabsFromContext() {
  return React.useContext<TabsHook>(TabsContext)
}

export interface TabsHook<T extends string = string> {
  tab: T
  setTab(tab: T)
}

export function useTabs<T extends string = string>(initialValue: T): TabsHook<T> {
  const [tab, setTab] = React.useState<T>(initialValue)

  return {
    tab,
    setTab,
  }
}

export interface TabsProps {
  tabs: TabsHook<any>
  children?: any
  className?: string
}

export function Tabs(props: TabsProps) {
  const { tabs, children, className } = props

  return (
    <div className={"flex " + (className || "")}>
      <TabsContext.Provider value={tabs}>{children}</TabsContext.Provider>
    </div>
  )
}
