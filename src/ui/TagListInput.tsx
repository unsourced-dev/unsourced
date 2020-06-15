import cc from "classnames"
import React from "react"

import { FormHook } from "../form"
import { useOutsideClick } from "../utils/useOutsideClick"
import { FormFieldLabel } from "./FormFieldLabel"
import { Tag } from "./Tag"
import { useTheme } from "./Theme"

interface SearchResultProps {
  field: TagListHook
  onClick()
  result: Tag
}

function SearchResult(props: SearchResultProps) {
  const { field, result, onClick } = props
  return (
    <button
      className="block min-h-12 bg-white hover:bg-gray-200 px-2 py-3 w-full text-left"
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        field.push(result as any)
        onClick()
      }}
    >
      {result.label}
    </button>
  )
}

export interface Tag {
  label: string
  // color?: string
  value?: string
}

export interface TagListHook {
  values: Tag[]
  remove(index: number)
  push(value: Tag)
  search(query: string)
  loading?: boolean
  searching?: boolean
  error?: string | undefined
  searchResults: Tag[]
  form: FormHook<any>
}

export interface TagListInputProps {
  field: TagListHook
  label?: string
}

export function TagListInput(props: TagListInputProps) {
  const { field, label } = props
  const [focused, setFocused] = React.useState<boolean>(false)
  const [value, setValue] = React.useState<string>("")
  const menuRef = useOutsideClick(() => setFocused(false))
  const inputRef = React.useRef<HTMLInputElement>()
  const theme = useTheme()

  const disabled = field.form.isSubmitting
  const controlClass = cc(
    "flex flex-wrap",
    theme.form.control.raw,
    (disabled || field.loading) && theme.form.control.disabled,
    focused && theme.form.control.focused
  )

  function onFocus(e) {
    setFocused(true)
    field.search(value)
  }

  function onKeyDown(e) {
    if (e.keyCode === 13) {
      e.stopPropagation()
      e.preventDefault()
    }
  }

  function onChange(e) {
    setValue(e.target.value)
    field.search(e.target.value)
  }

  function onControlClick(e) {
    if (inputRef.current) {
      inputRef.current.focus()
    }
    if (!focused) {
      setFocused(true)
    }
  }

  function onResultClick() {
    setFocused(false)
    setValue("")
  }

  return (
    <div className={theme.form.field.wrapper}>
      <FormFieldLabel label={label} />
      <div ref={menuRef} className="relative" onClick={onControlClick}>
        <div className={controlClass}>
          {(field.values as any).map((v, i) => (
            <Tag index={i} tag={v} key={i} onDelete={() => field.remove(i)} className="mb-1" />
          ))}
          <input
            type="text"
            style={{ minWidth: "4rem" }}
            className="flex-auto py-1"
            value={value}
            onFocus={onFocus}
            disabled={disabled}
            onKeyDown={onKeyDown}
            onChange={onChange}
            ref={inputRef}
          />
        </div>
        {focused && (field.searching || field.searchResults.length > 0) && (
          <div className="border rounded w-full text-gray-700 leading-tight mt-1 z-10 absolute bg-white">
            {field.searching && field.searchResults.length === 0 && <div className="h-12 px-2 py-3">Searching...</div>}
            {(field.searchResults as any).map((r, i) => (
              <SearchResult field={field} result={r} onClick={onResultClick} key={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
