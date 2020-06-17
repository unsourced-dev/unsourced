import { useState } from "react"

import { FormHook } from "./types"

export interface FieldOneToManyHook<Value, FormValue> {
  values: Value[]
  options: UseFieldOneToManyOptions<Value, FormValue>
  remove(index: number)
  push(value: Value)
  search(query: string)
  loading: boolean
  searching: boolean
  error: string | undefined
  searchResults: Value[]
  form: FormHook<FormValue>
}

export interface UseFieldOneToManyOptions<Value, FormValue> {
  getValues(formValues: FormValue): Value[]
  search(text: string): Promise<Value[]>
  push(form: FormHook<FormValue>, value: Value)
  remove?(form: FormHook<FormValue>, value: Value, index: number)
  // onSave?(form: FormHook<FormValue>, added: Value[], removed: Value[]): void | Promise<any>
}

export function useFieldOneToMany<Value = any, FormValue = any>(
  form: FormHook<FormValue>,
  options: UseFieldOneToManyOptions<Value, FormValue>
): FieldOneToManyHook<Value, FormValue> {
  const { getValues } = options
  const values = getValues(form.values)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string>(undefined)
  const [searchResults, setSearchResults] = useState<Value[]>([])

  function remove(index: number) {
    if (options.remove) {
      options.remove(form, values[index], index)
    }
  }

  async function search(query: string) {
    try {
      setSearching(true)
      setError(undefined)
      const results = await options.search(query)
      setSearching(false)
      setSearchResults(results)
    } catch (err) {
      setSearching(false)
      setSearchResults([])
      setError(String(err.message || err))
    }
  }

  function push(value: Value) {
    options.push(form, value)
  }

  const loading = false
  return {
    values,
    options,
    remove,
    push,
    searching,
    loading,
    error,
    searchResults,
    search,
    form,
  }
}
