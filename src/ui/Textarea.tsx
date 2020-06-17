import cc from "classnames"
import React from "react"

import { useErrorMessage, useFieldProps, useFormFromContext } from "../form"
import { FormFieldError } from "./FormFieldError"
import { FormFieldHint } from "./FormFieldHint"
import { FormFieldLabel } from "./FormFieldLabel"
import { useTheme } from "./Theme"

export interface TextareaProps {
  name?: string
  value?: string
  disabled?: boolean
  setValue?(value: string, e: React.ChangeEvent<HTMLTextAreaElement>)
  label?: React.ReactNode
  error?: React.ReactNode
  hint?: React.ReactNode
  className?: string
  rows?: number
  autoFocus?: boolean
  placeholder?: string
  textareaClassName?: string
  maxLength?: number
}

export function Textarea(props: TextareaProps) {
  const {
    label,
    name,
    error,
    disabled,
    setValue,
    value,
    hint,
    rows = 5,
    autoFocus,
    placeholder,
    textareaClassName,
    maxLength,
  } = props
  const form = useFormFromContext()
  const errorMessage = useErrorMessage({ form, name, error })
  const textareaProps = useFieldProps(form, { name, disabled, setValue, value })

  const theme = useTheme()
  const className = cc(
    "resize-none block",
    theme.form.control.raw,
    errorMessage && theme.form.control.error,
    textareaClassName
  )

  return (
    <div className={props.className || theme.form.field.wrapper}>
      <FormFieldLabel label={label} htmlFor={name} />
      <FormFieldHint hint={hint} error={errorMessage} />
      <textarea
        {...textareaProps}
        rows={rows}
        className={className}
        placeholder={placeholder}
        autoFocus={autoFocus}
        maxLength={maxLength}
      />
      <FormFieldError error={errorMessage} />
    </div>
  )
}
