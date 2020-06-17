import React from "react"

import { useTheme } from "./Theme"

export interface FormFieldErrorProps {
  error: React.ReactNode
}

export function FormFieldError(props: FormFieldErrorProps) {
  const { error } = props
  const theme = useTheme()
  if (!error) {
    return <div />
  }
  return <div className={theme.form.field.error}>{error}</div>
}
