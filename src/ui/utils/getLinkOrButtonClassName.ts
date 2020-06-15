import cc from "classnames"

import { Theme } from "../Theme"

export type LinkOrButtonStyle = "primary" | "secondary" | "link" | "icon" | "unstyled" | "danger"

export function getLinkOrButtonClassName(
  theme: Theme,
  style: LinkOrButtonStyle,
  disabled: boolean,
  className?: string
) {
  if (style === "unstyled") return className

  const classes = theme.buttons[style]
  if (disabled) {
    return cc(classes.all, classes.disabled, className)
  }
  return cc(classes.all, classes.enabled, className)
}
