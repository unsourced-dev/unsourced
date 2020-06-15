import cc from "classnames"
import React from "react"

import { useFormFromContext } from "../form"
import { useTheme } from "./Theme"

export interface FormErrorProps {
  className?: string
}

export function FormError(props: FormErrorProps) {
  const form = useFormFromContext()
  const error = form && form.status
  const valid = form && (form.isValid || form.submitCount === 0)
  const theme = useTheme()
  if (!error && valid) {
    return <span />
  }

  const className = cc(theme.form.error, props.className)
  return <div className={className}>{String(error || "Some fields are invalid.")}</div>
}
