import React from "react"

import { useTheme } from "./Theme"

export interface FormFieldHintProps {
  hint?: string
  error?: string
}

export function FormFieldHint(props: FormFieldHintProps) {
  const { hint, error } = props
  const theme = useTheme()
  if (!hint || error) {
    return <div />
  }
  return <div className={theme.form.field.hint}>{String(hint)}</div>
}
