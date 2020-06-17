import cc from "classnames"
import React from "react"

import { FormHook, useErrorMessage, useFormFromContext } from "../form"
import { useFieldFile } from "../form/file"
import { FormFieldError } from "./FormFieldError"
import { FormFieldHint } from "./FormFieldHint"
import { FormFieldLabel } from "./FormFieldLabel"
import { RawInputWithIcon } from "./RawInputWithIcon"
import { useTheme } from "./Theme"

//
// -----------------------------------------------------
//

export interface FileRawInputProps {
  form?: FormHook<any>
  errorMessage?: React.ReactNode
  name?: string
  label?: React.ReactNode
  value?: FileDef
  setValue?(value: FileDef)
  disabled?: boolean
  accept?: string
  validate?(file: File): string | null
  folder?: string
  preserve?: boolean
}

export function FileRawInput(props: FileRawInputProps) {
  const { form, accept, errorMessage } = props
  const { value, name, status, disabled, onChange, deleteFile } = useFieldFile(form, props)
  const theme = useTheme()
  const className = cc(theme.form.control.raw, errorMessage && theme.form.control.error)

  switch (status) {
    case "loading":
    case "deleting":
      return (
        <RawInputWithIcon
          icon="loading"
          className={className}
          value={value.deleting ? `Deleting ${value.name || "file"}...` : `Uploading ${value.name || "file"}...`}
          name={name}
          type="text"
          disabled
        />
      )
    case "file":
      return (
        <RawInputWithIcon
          icon="trash"
          onClick={deleteFile}
          className={className}
          value={value.name || value.url}
          name={name}
          type="text"
          modal={{}}
          disabled
        />
      )
    case "empty":
      return (
        <input
          className={className}
          type="file"
          disabled={disabled}
          name={name}
          autoComplete="off"
          accept={accept || "image/*, video/*, video/mp4,video/x-m4v"}
          onChange={onChange}
        />
      )
  }
  return null
}

//
// -----------------------------------------------------
//

export interface FileDef {
  name?: string
  url?: string
  path?: string
  contentType?: string
  loading?: boolean
  deleting?: boolean
  size?: number
}

export interface FileInputProps {
  name?: string
  label?: React.ReactNode
  error?: React.ReactNode
  value?: FileDef
  setValue?(value: FileDef)
  disabled?: boolean
  accept?: string
  validate?(file: File): string | null
  folder?: string
  preserve?: boolean
  className?: string
  hint?: React.ReactNode
}

export function FileInput(props: FileInputProps) {
  const { name, label, error, className, hint } = props
  const form = useFormFromContext()
  const errorMessage = useErrorMessage({ form, name, error })
  const theme = useTheme()

  return (
    <div className={className || theme.form.field.wrapper}>
      <FormFieldLabel label={label} htmlFor={name} />
      <FileRawInput {...props} form={form} errorMessage={errorMessage} />
      <FormFieldError error={errorMessage} />
      <FormFieldHint hint={hint} error={errorMessage} />
    </div>
  )
}
