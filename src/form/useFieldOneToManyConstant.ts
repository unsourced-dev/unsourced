import { getIn } from "formik"
import { useMemo, useState } from "react"

import { StringMap } from "../types"
import { getWords } from "../utils/keywords"
import { FormHook } from "./useForm"

export function filterSelectOptions(values: ConstantValue[], text: string): ConstantValue[] {
  if (!text) return values

  const lower = text.toLocaleLowerCase()
  const words = getWords(text)

  return values.filter((option) => {
    const text = (option.label || option.value).toLocaleLowerCase()
    if (text.includes(lower)) {
      return true
    }

    const optionWords = getWords(text)

    for (const word of words) {
      if (optionWords.includes(word)) {
        return true
      }
    }

    return false
  })
}

export interface UseFieldOneToManyConstantOptions {
  name: string
  values: ConstantValue[]
}

function computeValueMap(values: ConstantValue[]): StringMap<ConstantValue> {
  const result: StringMap<ConstantValue> = {}

  for (const value of values) {
    result[value.value] = value
  }

  return result
}

function getValues(form: FormHook<any>, options: UseFieldOneToManyConstantOptions, valueMap: StringMap<ConstantValue>) {
  const result = getIn(form.values, options.name) || []
  return result.map((id) => valueMap[id])
}

export interface ConstantValue {
  label?: string
  value: string
}

export interface ConstantListFieldHook {
  values: ConstantValue[]
  options: UseFieldOneToManyConstantOptions
  remove(index: number)
  push(value: ConstantValue)
  search(query: string)
  searchResults: ConstantValue[]
  form: FormHook<any>
}

export function useFieldOneToManyConstant(
  form: FormHook<any>,
  options: UseFieldOneToManyConstantOptions
): ConstantListFieldHook {
  const valueMap = useMemo(() => computeValueMap(options.values), [options.values])
  const [values, setValues] = useState<ConstantValue[]>(() => getValues(form, options, valueMap))
  const [searchResults, setSearchResults] = useState<ConstantValue[]>([])

  function remove(index: number) {
    const values: string[] = getIn(form.values, options.name) || []
    const updated = [...values]
    updated.splice(index, 1)
    setValues(updated.map((value) => valueMap[value]))
    form.setFieldValue(options.name, updated)
  }

  function push(value: ConstantValue) {
    const values: string[] = getIn(form.values, options.name) || []
    const updated = values.concat(value.value)
    setValues(updated.map((value) => valueMap[value]))
    form.setFieldValue(options.name, updated)
  }

  function search(query: string) {
    let results = filterSelectOptions(options.values, query) as ConstantValue[]

    // remove the values that are already set
    const values: string[] = getIn(form.values, options.name) || []
    results = results.filter((r) => !values.includes(r.value))

    setSearchResults(results)
  }

  return {
    searchResults,
    values,
    remove,
    push,
    search,
    options,
    form,
  }
}
