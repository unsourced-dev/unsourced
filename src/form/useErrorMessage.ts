import { getIn } from "formik"
import { ReactNode } from "react"

import { FormHook } from "./types"

export interface UseErrorMessagePayload {
  form?: FormHook<any>
  name?: string
  error?: ReactNode
}

export function useErrorMessage(payload: UseErrorMessagePayload): ReactNode | undefined {
  if (payload.error) {
    return payload.error
  }

  const { form, name } = payload
  if (form && name) {
    const error = getIn(form.errors, name)
    const touched = getIn(form.touched, name)
    return touched && error && (error.message || error.type || error)
  }

  return undefined
}
