import React from "react"

import { Icon } from "./Icon"
import { useTheme } from "./Theme"
import { getLinkOrButtonClassName } from "./utils/getLinkOrButtonClassName"

export type ButtonStyle = "primary" | "secondary" | "light" | "dark" | "link" | "icon" | "unstyled" | "danger"

export interface ButtonProps {
  style?: ButtonStyle
  disabled?: boolean
  active?: boolean
  small?: boolean
  className?: string
  onClick?(e: React.MouseEvent): Promise<any> | void
  type?: "button" | "submit" | "reset"
  ariaLabel?: string
  tabIndex?: number
  children?: any
  buttonRef?: React.LegacyRef<HTMLButtonElement>
  buttonStyle?: any
  loading?: boolean
}

export function Button(props: ButtonProps) {
  const {
    style = "secondary",
    disabled,
    className,
    active,
    small,
    type = "button",
    buttonRef,
    buttonStyle,
    loading,
    children,
    onClick: rawOnClick,
    ...rest
  } = props
  const theme = useTheme()
  const [autoLoading, setAutoLoading] = React.useState<boolean>(false)

  function onClick(e) {
    const res = rawOnClick && rawOnClick(e)
    if (res && res.then) {
      setAutoLoading(true)
      res.then((v) => {
        setAutoLoading(false)
        return v
      })
      if (res.catch) {
        res.catch((err) => {
          setAutoLoading(false)
          throw err
        })
      }
    }
  }

  const isLoading = loading || autoLoading
  return (
    <button
      className={getLinkOrButtonClassName(theme, style, disabled || isLoading, className)}
      disabled={disabled || isLoading}
      type={type}
      ref={buttonRef}
      {...rest}
      style={buttonStyle}
      onClick={onClick}
    >
      {isLoading ? (
        <span className="relative">
          <span className="opacity-0">{children}</span>
          <span className="absolute left-0 inline-flex w-full items-center justify-center">
            <Icon name="loading" />
          </span>
        </span>
      ) : (
        children
      )}
    </button>
  )
}
