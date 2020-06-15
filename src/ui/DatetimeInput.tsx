import cc from "classnames"
import { getIn } from "formik"
import React from "react"
import InputMask from "react-input-mask"

import { FormHook, useErrorMessage, useFormFromContext } from "../form"
import { datetimeToString, parseDatetime, parseTime, timeToString } from "../utils/date"
import { useLogger } from "../utils/useLogger"
import { FormFieldError } from "./FormFieldError"
import { FormFieldHint } from "./FormFieldHint"
import { FormFieldLabel } from "./FormFieldLabel"
import { useTheme } from "./Theme"

//
// -----------------------------------------------------
//

function getMask(type: DateTimeType) {
  switch (type) {
    case "date":
      return "99-99-9999"
    case "time":
      return "99:99"
    case "datetime":
    default:
      return "99-99-9999 99:99"
  }
}

function getPlaceholder(type: DateTimeType) {
  switch (type) {
    case "date":
      return "DD-MM-YYYY"
    case "time":
      return "hh:mm"
    case "datetime":
    default:
      return "DD-MM-YYYY hh:mm"
  }
}

function getMaskPlaceholder(type: DateTimeType) {
  switch (type) {
    case "date":
      return "DD-MM-YYYY"
    case "time":
      return "hh:mm"
    case "datetime":
    default:
      return "DD-MM-YYYY hh:mm"
  }
}

//
// -----------------------------------------------------
//

export interface GetFieldPropsPayload {
  name: string
  disabled?: boolean
  type: DateTimeType
}

export interface FieldProps {
  name?: string
  value?: string
  onChange?(e: any)
  onBlur?(e: any)
  disabled?: boolean
}

function localToUTC2(datetime: string, type: DateTimeType): string {
  try {
    switch (type) {
      case "date":
        return datetime
      case "datetime":
        const date = parseDatetime(datetime, "local", "UTC+2")
        return datetimeToString(date)
      case "time":
        const time = parseTime(datetime, "local", "UTC+2")
        return timeToString(time)
    }
  } catch (_) {
    // this is when the user enters an invalid datetime
    return datetime
  }
}

function localFromUTC2(datetime: string, type: DateTimeType): string {
  try {
    switch (type) {
      case "date":
        return datetime
      case "datetime":
        const date = parseDatetime(datetime, "UTC+2", "local")
        return datetimeToString(date)
      case "time":
        const time = parseTime(datetime, "UTC+2", "local")
        return timeToString(time)
    }
  } catch (_) {
    // this is when the user enters an invalid datetime
    return datetime
  }
}

export function useFieldProps(form: FormHook<any>, options: GetFieldPropsPayload): FieldProps {
  const logger = useLogger()
  const { name, disabled } = options

  const value = localFromUTC2(getIn(form.values, name), options.type)
  const onChange = (e: any) => {
    const toSet = localToUTC2(e.target.value, options.type)
    form.setFieldValue(name, toSet)
  }

  const result: FieldProps = {
    name,
    value,
    onChange,
    onBlur: form.handleBlur,
    disabled: disabled || form.isSubmitting || logger.loading,
  }

  return result
}

//
// -----------------------------------------------------
//

export type DateTimeType = "time" | "date" | "datetime"

export interface DatetimeInputProps {
  name?: string
  type?: DateTimeType
  disabled?: boolean
  label?: string
  error?: string
  hint?: string
  placeholder?: string
  className?: string
  inputClassName?: string
}

export function DatetimeInput(props: DatetimeInputProps) {
  const { label, name, error, disabled, hint, type = "datetime" } = props
  const form = useFormFromContext()
  const errorMessage = useErrorMessage({ form, name, error })
  const inputProps = useFieldProps(form, { name, disabled, type })
  const theme = useTheme()
  const className = cc(theme.form.control.raw, errorMessage && theme.form.control.error, props.inputClassName)

  const mask = getMask(type)
  const placeholder = props.placeholder || getPlaceholder(type)
  const maskChar = getMaskPlaceholder(type)
  return (
    <div className={props.className || theme.form.field.wrapper}>
      <FormFieldLabel label={label} htmlFor={name} />
      <InputMask
        {...inputProps}
        className={className}
        mask={mask}
        placeholder={placeholder}
        maskPlaceholder={maskChar}
      />
      <FormFieldError error={errorMessage} />
      <FormFieldHint hint={hint} error={errorMessage} />
    </div>
  )
}
