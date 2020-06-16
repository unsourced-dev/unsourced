import { getIn } from "formik"

import { useLogger } from "../logger/useLogger"
import { FormHook } from "./useForm"

export interface GetFieldPropsPayload<Value> {
  name?: string
  value?: Value
  setValue?(value: Value, e: any)
  onChange?(e: any)
  disabled?: boolean
}

export interface FieldProps<Value> {
  name?: string
  value?: Value
  onChange?(e: any)
  onBlur?(e: any)
  disabled?: boolean
}

export function useFieldProps<Value = any>(
  form: FormHook<any>,
  options: GetFieldPropsPayload<Value>
): FieldProps<Value> {
  const logger = useLogger()
  const { name, disabled } = options

  if (form && name) {
    const value = options.value || getIn(form.values, name)
    const onChange = options.setValue ? (e) => options.setValue(e.target.value, e) : form.handleChange

    const result: FieldProps<Value> = {
      name,
      value,
      onChange,
      onBlur: form.handleBlur,
      disabled: disabled || form.isSubmitting || logger.loading,
    }

    return result
  }

  const { value, setValue } = options
  return {
    name,
    value,
    disabled,
    onChange: setValue && ((e: any) => setValue(e.target.value, e)),
  }
}
