import React from "react"

import { SearchHook } from "../firebase/firestore/useSearch"
import { useForm } from "../form"
import { Form } from "./Form"
import { Input } from "./Input"
import { SubmitButton } from "./SubmitButton"

export interface SearchBarProps {
  search: SearchHook
  className?: string
}

export function SearchBar(props: SearchBarProps) {
  const { search, className } = props
  const form = useForm<any>({
    initialValues: {},
    onSubmit() {
      if (search.ready) {
        search.search()
      }
    },
  })

  return (
    <Form form={form} className={"flex w-full " + (className || "")}>
      <Input value={search.text} setValue={search.setText} disabled={!search.ready} className="flex-auto" />
      <SubmitButton style="primary" disabled={!search.ready} className="ml-2 mb-2">
        Search
      </SubmitButton>
    </Form>
  )
}
