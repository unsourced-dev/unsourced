import cc from "classnames"
import React from "react"

import { ConfirmButton, ConfirmButtonModal } from "./ConfirmButton"
import { Icon, IconName } from "./Icon"
import { Link } from "./Link"

export interface MenuItemProps {
  label: string
  icon?: IconName
  onClick?()
  className?: string
  href?: string
  as?: string
  selected?: boolean
  modal?: ConfirmButtonModal
}

export function MenuItem(props: MenuItemProps) {
  const { label, icon, onClick, href, as, selected, modal } = props

  const className = cc(
    "block px-2 py-1 w-full text-left text-green-hover",
    {
      "text-green font-semibold": selected,
    },
    props.className
  )

  if (href) {
    return (
      <Link href={href} as={as} className={className} style="unstyled">
        {icon && <Icon name={icon} size="small" />}
        {label}
      </Link>
    )
  }

  if (onClick) {
    const clickHandler = (e) => {
      e.preventDefault()
      e.stopPropagation()
      return onClick()
    }
    if (modal) {
      return (
        <ConfirmButton style="unstyled" className={className} modal={modal} onClick={clickHandler}>
          {icon && <Icon name={icon} size="small" />}
          {label}
        </ConfirmButton>
      )
    }
    return (
      <button className={className} onClick={clickHandler}>
        {icon && <Icon name={icon} size="small" />}
        {label}
      </button>
    )
  }

  return (
    <div className={className}>
      {icon && <Icon name={icon} size="small" />}
      {label}
    </div>
  )
}
