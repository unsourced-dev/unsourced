import { getIn } from "formik"
import { useCallback } from "react"

import { FormHook } from "./types"

export interface FieldArrayHook<T> {
  form: FormHook<any>
  name: string
  values: T[]
  push(value: T): void
  swap(index1: number, index2: number): void
  insert(index: number, value: T): void
  update(index: number, value: T): void
  remove(index: number)
  isFirstValue(index: number): boolean
  isLastValue(index: number): boolean
}

function checkIndex(values: any[], index: number) {
  return index >= 0 && index < values.length
}

export function useFieldArray<T>(form: FormHook<any>, name: string): FieldArrayHook<T> {
  const values: T[] = getIn(form.values, name) || []

  const push = useCallback(
    (value: T) => {
      form.setFieldValue(name, values.concat(value))
    },
    [values, form.setFieldValue]
  )

  const swap = useCallback(
    (index1: number, index2: number) => {
      if (!checkIndex(values, index1) || !checkIndex(values, index2)) return
      const newValues = [...values]
      newValues[index1] = values[index2]
      newValues[index2] = values[index1]
      form.setFieldValue(name, newValues)
    },
    [values, form.setFieldValue]
  )

  const insert = useCallback(
    (index: number, value: T) => {
      if (!checkIndex(values, index)) return
      const newValues = [...values.slice(0, index), value, ...values.slice(index)]
      form.setFieldValue(name, newValues)
    },
    [values, form.setFieldValue]
  )

  const update = useCallback(
    (index: number, value: T) => {
      if (!checkIndex(values, index)) return
      const newValues = [...values]
      newValues[index] = value
      form.setFieldValue(name, newValues)
    },
    [values, form.setFieldValue]
  )

  const remove = useCallback(
    (index: number) => {
      if (!checkIndex(values, index)) return
      const newValues = [...values.slice(0, index), ...values.slice(index + 1)]
      form.setFieldValue(name, newValues)
    },
    [values, form.setFieldValue]
  )

  const isFirstValue = useCallback((index: number) => index === 0, [])

  const isLastValue = useCallback((index: number) => index === values.length - 1, [values])

  return {
    form,
    name,
    values,
    push,
    swap,
    insert,
    update,
    remove,
    isFirstValue,
    isLastValue,
  }
}
