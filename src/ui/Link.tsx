import NextLink from "next/link"
import React from "react"

import { useTheme } from "./Theme"
import { getLinkOrButtonClassName } from "./utils/getLinkOrButtonClassName"

export type LinkStyle = "primary" | "secondary" | "link" | "icon" | "unstyled"

export interface LinkProps {
  onClick?(e: React.MouseEvent)
  href: string
  as?: string
  style?: LinkStyle
  ariaLabel?: string
  disabled?: boolean
  children?: any
  className?: string
  target?: string
  download?: string
}

export function Link(props: LinkProps) {
  const { href, as, style = "link", target, disabled, download, onClick, children } = props
  const theme = useTheme()
  const className = getLinkOrButtonClassName(theme, style, disabled, props.className)
  if (target) {
    return (
      <a href={href} className={className} target={target} download={download} onClick={onClick}>
        {children}
      </a>
    )
  }
  return (
    <NextLink href={href} as={as}>
      <a className={className} download={download} onClick={onClick}>
        {children}
      </a>
    </NextLink>
  )
}
