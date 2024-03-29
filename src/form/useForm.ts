import { useFormik } from "formik"
import { MutableRefObject, useMemo, useRef } from "react"

import { LoggerHook, useLogger } from "../utils/logger/useLogger"
import { useConfirmOnLeave } from "../utils/useConfirmOnLeave"
import { FormHook, UseFormOptions } from "./types"

function getOnSubmit<Values>(optionsRef: MutableRefObject<UseFormOptions<Values>>, logger: LoggerHook) {
  const { onSubmit, document, notifyOnSuccess, notifyOnError } = optionsRef.current || {}
  if (document) {
    return async (values: Values, form: FormHook<Values>) => {
      // the form is actually a formik form, dirty hack to set the document
      form.document = document
      try {
        form.setStatus(undefined)
        await document.set(values)

        let hasError = null
        if (onSubmit) {
          const result = await onSubmit(values, form)

          if (result && result.error) form.setStatus(result.error)
          if (result && result.errors) form.setErrors(result.errors)
          hasError = result && (result.error || result.errors)
        }

        if (hasError) {
          if (notifyOnError) {
            logger.addNotification({ type: "error", text: notifyOnError })
          }
        } else if (notifyOnSuccess) {
          logger.addNotification({ type: "info", text: notifyOnSuccess })
        }
      } catch (err) {
        console.error("Error while setting document.", err)
        console.error("Values in form: ", values)
        form.setStatus("An error occurred while saving!")

        if (notifyOnError) {
          logger.addNotification({ type: "error", text: notifyOnError })
        }
      }
    }
  } else if (onSubmit) {
    return async (values: Values, form: FormHook<Values>) => {
      // the form is actually a formik form, dirty hack to set the document
      form.document = document
      try {
        const result = await onSubmit(values, form)

        if (result && result.error) form.setStatus(result.error)
        if (result && result.errors) form.setErrors(result.errors)

        const hasError = result && (result.error || result.errors)
        if (hasError) {
          if (notifyOnError) {
            logger.addNotification({ type: "error", text: notifyOnError })
          }
        } else if (notifyOnSuccess) {
          logger.addNotification({ type: "info", text: notifyOnSuccess })
        }
      } catch (err) {
        if (notifyOnError) {
          logger.addNotification({ type: "error", text: notifyOnError })
        }
        throw err
      }
    }
  }
  return undefined
}

export function useForm<Values = any>(options: UseFormOptions<Values> = {}): FormHook<Values> {
  const logger = useLogger()

  const optionsRef = useRef<UseFormOptions<Values>>(options)
  optionsRef.current = options

  const onSubmit = useMemo<any>(() => getOnSubmit(optionsRef, logger), [optionsRef])
  const initialValues: any = options.initialValues || (options.document && options.document.values) || {}
  const formik = useFormik({ ...options, onSubmit, initialValues })
  useConfirmOnLeave(options.warnOnExitDirty && !formik.isSubmitting && formik.dirty)

  if (options.document) {
    options.document.setForm(formik)
  }

  return {
    ...formik,
    document: options.document,
    ready: formik.values && Object.keys(formik.values).length > 0,
  } as any
}
