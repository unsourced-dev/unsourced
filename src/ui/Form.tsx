import React from "react"

import { FormContext } from "../form/FormContext"
import { FormHook } from "../form/types"

export interface FormProps {
  form: FormHook
  className?: string
  children?: any
}

export function Form(props: FormProps) {
  const { form, className, children = [] } = props

  return (
    <form onSubmit={form.handleSubmit} onReset={form.handleReset} className={className || "flex-auto w-full"}>
      <FormContext.Provider value={form}>{children}</FormContext.Provider>
    </form>
  )
}
