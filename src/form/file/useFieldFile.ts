import { ChangeEvent } from "react"

import { deleteFile as deleteFileFirebase, uploadFile } from "../../firebase/storage"
import { FileDef } from "../../ui/FileInput"
import { useLogger } from "../../utils/logger/useLogger"
import { useFieldProps } from "../useFieldProps"
import { FormHook } from "../useForm"

export type FileFieldHookStatus = "empty" | "loading" | "deleting" | "file"

export interface FieldFileHook {
  status: FileFieldHookStatus
  value: FileDef
  name: string
  upload(file: File): Promise<void>
  deleteFile(): Promise<void>
  onChange?(e: any)
  onBlur?(e: any)
  disabled?: boolean
}

export interface UseFieldFileOptions {
  name?: string
  value?: FileDef
  disabled?: boolean
  accept?: string
  validate?(file: File): string | null
  folder?: string
  preserve?: boolean
}

function getStatus(value: FileDef): FileFieldHookStatus {
  if (value && value.loading) return value.deleting ? "deleting" : "loading"
  if (value && value.url) return "file"
  return "empty"
}

export function useFieldFile(form: FormHook<any>, options: UseFieldFileOptions): FieldFileHook {
  const { validate } = options
  const logger = useLogger()
  const fieldProps = useFieldProps(form, options)
  const { name, value } = fieldProps
  const status = getStatus(value || {})

  async function upload(file: File) {
    if (status !== "empty") {
      return
    }

    const errorMessage = validate ? validate(file) : null
    if (errorMessage) {
      form.setFieldTouched(name, true, false)
      form.setFieldValue(name, {}, false)
      form.setFieldError(name, errorMessage)
      return
    }
    form.setFieldValue(name, {
      name: file.name,
      loading: true,
    })
    logger.setLoading(true)

    try {
      const { url, path } = await uploadFile(file, options)
      const value: FileDef = {
        name: file.name,
        url,
        path,
        contentType: file.type,
      }
      form.setFieldValue(name, value)
      logger.setLoading(false)
    } catch (err) {
      console.error("Error while uploading file: ", err)
      form.setFieldError(name, err.message || err)
      form.setFieldValue(name, {})
      logger.setLoading(false)
    }
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    return upload(e.target.files[0])
  }

  async function deleteFile() {
    if (status !== "file" || !value) {
      return
    }

    if (!value.path) {
      form.setFieldValue(name, {})
      return
    }

    form.setFieldValue(name, { name: value.name, loading: true, deleting: true })
    await deleteFileFirebase(value.path)
    form.setFieldValue(name, {})
  }

  return {
    status,
    value,
    name,
    upload,
    onChange,
    deleteFile,
    onBlur: form.handleBlur,
    disabled: status !== "empty" || form.isSubmitting,
  }
}
