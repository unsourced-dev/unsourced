import cc from "classnames"
import React from "react"

import { useErrorMessage, useFieldProps, useFormFromContext } from "../form"
import { FormFieldError } from "./FormFieldError"
import { FormFieldHint } from "./FormFieldHint"
import { FormFieldLabel } from "./FormFieldLabel"
import { useTheme } from "./Theme"

export interface InputProps {
  name?: string
  value?: string
  type?: "text" | "number" | "email" | "password"
  disabled?: boolean
  setValue?(value: string)
  label?: React.ReactNode
  placeholder?: string
  error?: React.ReactNode
  hint?: React.ReactNode
  className?: string
  inputClassName?: string
  autoFocus?: boolean
  maxLength?: number
  defaultValue?: string
}

export function Input(props: InputProps) {
  const {
    label,
    name,
    error,
    disabled,
    setValue,
    value,
    type,
    hint,
    autoFocus,
    placeholder,
    defaultValue,
    maxLength,
  } = props
  const form = useFormFromContext()
  const errorMessage = useErrorMessage({ form, name, error })
  const inputProps = useFieldProps(form, { name, disabled, setValue, value })
  const theme = useTheme()
  const className = cc(theme.form.control.raw, errorMessage && theme.form.control.error, props.inputClassName)

  return (
    <div className={props.className || theme.form.field.wrapper}>
      <FormFieldLabel label={label} htmlFor={name} />
      <input
        {...inputProps}
        type={type}
        className={className}
        autoFocus={autoFocus}
        placeholder={placeholder}
        maxLength={maxLength}
        defaultValue={defaultValue}
      />
      <FormFieldError error={errorMessage} />
      <FormFieldHint hint={hint} error={errorMessage} />
    </div>
  )
}
