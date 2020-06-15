import { getIn } from "formik"
import { useState } from "react"

import { FormHook } from "../form"
import { filterSelectOptions } from "./filterSelectOptions"
import { Language, LANGUAGES, LANGUAGES_MAP } from "./languages"

export interface UseLanguagesFieldOptions {
  name: string
}

function getValues(form: FormHook<any>, options: UseLanguagesFieldOptions) {
  const result = getIn(form.values, options.name) || []
  return result.map((id) => LANGUAGES_MAP[id])
}

export interface ConstantListFieldHook {
  values: Language[]
  options: UseLanguagesFieldOptions
  remove(index: number)
  push(value: Language)
  search(query: string)
  searchResults: Language[]
  form: FormHook<any>
}

export function useLanguagesField(form: FormHook<any>, options: UseLanguagesFieldOptions): ConstantListFieldHook {
  const [values, setValues] = useState<Language[]>(() => getValues(form, options))
  const [searchResults, setSearchResults] = useState<Language[]>([])

  function remove(index: number) {
    const values: string[] = getIn(form.values, options.name) || []
    const updated = [...values]
    updated.splice(index, 1)
    setValues(updated.map((value) => LANGUAGES_MAP[value]))
    form.setFieldValue(options.name, updated)
  }

  function push(value: Language) {
    const values: string[] = getIn(form.values, options.name) || []
    const updated = values.concat(value.value)
    setValues(updated.map((value) => LANGUAGES_MAP[value]))
    form.setFieldValue(options.name, updated)
  }

  function search(query: string) {
    let results = filterSelectOptions(LANGUAGES, query) as Language[]

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
