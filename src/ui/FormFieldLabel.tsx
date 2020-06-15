import React from "react"

import { useTheme } from "./Theme"

export interface FormFieldLabelProps {
  label?: string
  htmlFor?: string
}

export function FormFieldLabel(props: FormFieldLabelProps) {
  const { label, htmlFor } = props
  const theme = useTheme()
  if (!label) return null

  return (
    <label htmlFor={htmlFor} className={theme.form.field.label}>
      {label}
    </label>
  )
}
