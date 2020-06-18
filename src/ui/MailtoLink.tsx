import React from "react"

import { LinkStyle } from "./Link"
import { useTheme } from "./Theme"
import { getLinkOrButtonClassName } from "./utils/getLinkOrButtonClassName"

function getHref(props: MailtoLinkProps) {
  const { email } = props
  const subject = props.subject ? `subject=${encodeURIComponent(props.subject)}` : ""
  const body = props.body ? `body=${encodeURIComponent(props.body)}` : ""
  const and = (subject && body && "&") || ""
  return `mailto:${email}?${subject}${and}${body}`
}

export interface MailtoLinkProps {
  email: string
  subject?: string
  body?: string
  style?: LinkStyle
  onClick?(e: React.MouseEvent)
  ariaLabel?: string
  disabled?: boolean
  children?: any
  className?: string
  target?: string
}

export function MailtoLink(props: MailtoLinkProps) {
  const { style = "link", target, disabled, children } = props
  const theme = useTheme()
  const className = getLinkOrButtonClassName(theme, style, disabled, props.className)
  const href = getHref(props)
  const onClick = (e: any) => {
    e.preventDefault()
    window.open(href, props.subject || `Email to ${props.email}`)
    if (props.onClick) {
      props.onClick(e)
    }
  }

  return (
    <a href={href} className={className} target={target} onClick={onClick}>
      {children}
    </a>
  )
}
