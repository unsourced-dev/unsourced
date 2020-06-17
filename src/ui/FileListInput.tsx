import cc from "classnames"
import { getIn } from "formik"
import React from "react"

import { deleteFile as deleteFileFirebase, uploadFile } from "../firebase/storage"
import { FormHook, useErrorMessage, useFormFromContext } from "../form"
import { useLogger } from "../utils/logger/useLogger"
import { FileDef } from "./FileInput"
import { FormFieldError } from "./FormFieldError"
import { FormFieldHint } from "./FormFieldHint"
import { FormFieldLabel } from "./FormFieldLabel"
import { RawInputWithIcon } from "./RawInputWithIcon"
import { useTheme } from "./Theme"

function getValues(form: FormHook<any>, name: string, maxFiles?: number): FileDef[] {
  const val = getIn(form.values, name)
  const result = Array.isArray(val) ? val : val ? [val] : [{}]
  if (maxFiles) {
    if (maxFiles < 0 || result.length < maxFiles) {
      const last = result.length > 0 && result[result.length - 1]
      // list of images + we're not at the maximum, check if the last item is empty, if not, add an empty item
      if (!last || Object.keys(last).length > 0) return result.concat({})
      return result
    }
  } else if (result.length === 0) {
    // single image, but empty array in database
    return [{}]
  }

  return result
}

function getStatus(value: FileDef): FileFieldStatus {
  if (value && value.loading) return value.deleting ? "deleting" : "loading"
  if (value && value.url) return "file"
  return "empty"
}

function getStatuses(values: FileDef[]): FileFieldStatus[] {
  return values.map(getStatus)
}

function replaceLastItem(values: FileDef[], item: FileDef): FileDef[] {
  if (values.length === 0) return [item]
  return values.map((m, i) => (i === values.length - 1 ? item : m))
}

//
// -----------------------------------------------------
//

export interface FileListHookPayload {
  name: string
  folder?: string
  preserve?: boolean
  maxFiles?: number
  validate?(file: File): string | null
  hd?: boolean
}

export type FileFieldStatus = "empty" | "loading" | "deleting" | "file"

export interface FileListHook {
  name: string
  values: FileDef[]
  statuses: FileFieldStatus[]
  onChange(e): Promise<void>
  deleteFile(index: number): Promise<void>
  loading: boolean
  disabled: boolean
}

function useFileList(payload: FileListHookPayload, form: FormHook<any>): FileListHook {
  const { name, folder, preserve, maxFiles = -1, hd } = payload

  const logger = useLogger()
  const values = getValues(form, name, maxFiles)
  const statuses = getStatuses(values)

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files[0]

      const errorMessage = payload.validate ? payload.validate(file) : undefined
      if (errorMessage) {
        form.setFieldTouched(name, true, false)
        form.setFieldValue(name, {}, false)
        form.setFieldError(name, errorMessage)
        return
      }

      form.setFieldValue(name, replaceLastItem(values, { loading: true }), false)
      form.setFieldError(name, undefined)
      logger.setLoading(true)

      const { url, path } = await uploadFile(file, { folder, preserve })
      const value: FileDef = {
        name: file.name,
        path,
        url,
        size: file.size,
        contentType: file.type,
      }
      form.setFieldValue(name, replaceLastItem(values, value), false)
      logger.setLoading(false)

      logger.setLoading(false)
    } catch (err) {
      console.error("Error while uploading files: ", err)
      form.setFieldError(name, err.message || err)
      form.setFieldValue(name, values, false)
      logger.setLoading(false)
    }
  }

  async function deleteFile(index: number) {
    const value = values[index]
    if (getStatus(value) !== "file" || !value) {
      return
    }

    const { path, url } = value

    form.setFieldValue(
      name,
      values.map((v, i) => (i === index ? { path, name: value.name, url, loading: true, deleting: true } : v))
    )
    form.setFieldError(name, undefined)

    try {
      await deleteFileFirebase(path)
      form.setFieldValue(
        name,
        values.filter((_, i) => i !== index)
      )

      if (form.document && form.document.exists) {
        await form.submitForm()
      }
    } catch (err) {
      console.error("Error while deleting file. ", err)
      form.setFieldError(name, err.message || err)
      form.setFieldValue(name, values)
    }
  }

  const loading = statuses.reduce((prev, curr) => prev || curr === "loading", false)
  return {
    name,
    values,
    statuses,
    onChange,
    deleteFile,
    loading,
    disabled: logger.loading,
  }
}

//
// -----------------------------------------------------
//

interface RawSingleFileInputProps {
  files: FileListHook
  index: number
  accept?: string
  errorMessage?: string
}

function RawSingleFileInput(props: RawSingleFileInputProps) {
  const { files, index, accept, errorMessage } = props
  const value = files.values[index]
  const status = files.statuses[index]
  const name = files.name + "." + index
  const theme = useTheme()
  const className = cc(theme.form.control.raw, errorMessage && theme.form.control.error)

  switch (status) {
    case "file":
      return (
        <RawInputWithIcon
          icon="trash"
          onClick={() => files.deleteFile(index)}
          className={className}
          value={value.name || value.url}
          name={name}
          type="text"
          modal={{}}
          disabled
        />
      )
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
    case "empty":
    default:
      return (
        <input
          className={className}
          type="file"
          disabled={files.disabled}
          name={name}
          autoComplete="off"
          accept={accept || "image/*, video/*, video/mp4,video/x-m4v"}
          onChange={files.onChange}
        />
      )
  }
}

//
// -----------------------------------------------------
//

interface RawFileListInputProps {
  files: FileListHook
  accept?: string
  errorMessage?: React.ReactNode
}

function RawFileListInput(props: RawFileListInputProps) {
  const { files, accept } = props

  return (
    <div>
      {files.values.map((_, i) => (
        <RawSingleFileInput files={files} index={i} accept={accept} key={i} />
      ))}
    </div>
  )
}

//
// -----------------------------------------------------
//

export interface FileListInputProps {
  name: string
  label?: React.ReactNode
  folder?: string
  preserve?: boolean
  /** The number of files to upload, defaults to -1 i.e. unlimitted. */
  maxFiles?: number
  disabled?: boolean
  accept?: string
  validate?(file: File): string | null
  className?: string
  hint?: React.ReactNode
}

export function FileListInput(props: FileListInputProps) {
  const { name, label, className, hint, accept } = props
  const form = useFormFromContext()
  const errorMessage = useErrorMessage({ form, name })
  const theme = useTheme()
  const files = useFileList(props, form)

  return (
    <div className={className || theme.form.field.wrapper}>
      <FormFieldLabel label={label} htmlFor={name} />
      <RawFileListInput files={files} accept={accept} errorMessage={errorMessage} />
      <FormFieldError error={errorMessage} />
      <FormFieldHint hint={hint} error={errorMessage} />
    </div>
  )
}
