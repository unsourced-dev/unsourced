import { createContext, useContext } from "react"

import { FormHook } from "./useForm"

export const FormContext = createContext<FormHook>(null)

export function useFormFromContext<T = any>() {
  return useContext<FormHook<T>>(FormContext)
}
