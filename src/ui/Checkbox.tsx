import cc from "classnames"
import React from "react"

import { useErrorMessage, useFieldProps, useFormFromContext } from "../form"
import { FormFieldError } from "./FormFieldError"
import { FormFieldHint } from "./FormFieldHint"
import { useTheme } from "./Theme"

export interface CheckboxProps {
  value?: boolean
  name?: string
  label?: string
  disabled?: boolean
  setValue?(value: boolean)
  error?: string
  className?: string
  inputClassName?: string
  labelClassName?: string
  hint?: string
  children?: any
}

export function Checkbox(props: CheckboxProps) {
  const {
    label,
    name,
    error,
    disabled,
    setValue,
    value,
    className,
    inputClassName,
    labelClassName,
    hint,
    children,
  } = props
  const form = useFormFromContext()
  const errorMessage = useErrorMessage({ form, name, error })
  const inputProps = useFieldProps<any>(form, { name, disabled, setValue, value })
  const theme = useTheme()

  return (
    <label className={cc(theme.form.field.wrapper, "checkbox", className)}>
      <input className={cc("mr-2", inputClassName)} type="checkbox" {...inputProps} checked={inputProps.value} />
      {label && <span className={labelClassName}>{label}</span>}
      {children}
      <FormFieldError error={errorMessage} />
      <FormFieldHint hint={hint} error={errorMessage} />
    </label>
  )
}
