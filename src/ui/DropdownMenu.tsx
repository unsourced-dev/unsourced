import React from "react"

import { useOutsideClick } from "../utils/useOutsideClick"
import { Button, ButtonStyle } from "./Button"
import { Icon, IconName } from "./Icon"
import { MediaDef } from "./Media"
import { MediaIcon } from "./MediaIcon"

export interface DropdownMenuProps {
  label?: React.ReactNode
  icon?: IconName
  style?: ButtonStyle
  className?: string
  children?: any
  right?: boolean
  iconOpen?: IconName
  media?: MediaDef
  mediaClass?: string
  classes?: {
    button?: string
    items?: string
    icon?: string
    iconContainer?: string
  }
}

export function DropdownMenu(props: DropdownMenuProps) {
  const { label, icon, style, className, right, children, media, mediaClass, classes } = props
  const iconOpen = props.iconOpen ? props.iconOpen : props.icon
  const [open, setOpen] = React.useState<boolean>(false)
  const menuRef = useOutsideClick(() => setOpen(false))

  const clickHandler = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setOpen(!open)
  }

  return (
    <div className={className || "relative"}>
      <Button
        style={style}
        onClick={clickHandler}
        buttonRef={menuRef}
        className={"flex items-center " + (classes?.button || "")}
      >
        {label}
        <div className={classes?.iconContainer}>
          {!media && icon && <Icon name={open ? iconOpen : icon} size="small" className={classes?.icon || "ml-2"} />}
          {media && <MediaIcon media={media} fallback={icon} className={mediaClass} />}
        </div>
      </Button>
      <div
        style={{ display: open ? "block" : "none", right: right ? 0 : undefined }}
        className={classes?.items || "border rounded w-64 text-gray-700 leading-tight mt-1 z-10 absolute bg-white"}
      >
        {children}
      </div>
    </div>
  )
}
