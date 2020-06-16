import {
    FieldHelperProps, FieldInputProps, FieldMetaProps, FormikConfig, FormikState, useFormik
} from "formik"
import { ChangeEvent, FormEvent, useMemo } from "react"

import { LoggerHook, useLogger } from "../logger/useLogger"
import { StringMap } from "../types"
import { useConfirmOnLeave } from "../utils/useConfirmOnLeave"

export interface SubmitError {
  message: string
  type?: string
}

export interface SubmitResult {
  error?: string
  errors?: StringMap<string>
}

export interface FormHookDocument<Values = any> {
  values?: Values
  exists: boolean
  set(values: Values): Promise<any>
  setForm(form: any) // should be FormikHook, but they didn't type it...
}

export interface UseFormOptions<Values> extends Omit<FormikConfig<Values>, "onSubmit" | "initialValues"> {
  initialValues?: Values
  document?: FormHookDocument<Values>
  onSubmit?(values: Values): void | SubmitResult | Promise<void | SubmitResult>
  notifyOnSuccess?: string
  notifyOnError?: string
}

export interface NestedStringMap<T> {
  [key: string]: T | NestedStringMap<T>
}

export interface FormHook<Values = any> {
  document?: FormHookDocument<Values>
  initialValues: Values
  initialErrors: NestedStringMap<string>
  initialTouched: NestedStringMap<boolean>
  initialStatus: any
  handleBlur: (eventOrString: any) => void | ((e: any) => void)
  handleChange: (
    eventOrPath: string | ChangeEvent<any>
  ) => void | ((eventOrTextValue: string | ChangeEvent<any>) => void)
  handleReset: (e: any) => void
  handleSubmit: (e?: FormEvent<HTMLFormElement> | undefined) => void
  resetForm: (nextState?: Partial<FormikState<Values>> | undefined) => void
  setErrors: (errors: StringMap<any>) => void
  setFormikState: (stateOrCb: FormikState<Values> | ((state: FormikState<Values>) => FormikState<Values>)) => void
  setFieldTouched: (field: string, touched?: boolean, shouldValidate?: boolean | undefined) => any
  setFieldValue: (field: string, value: any, shouldValidate?: boolean | undefined) => any
  setFieldError: (field: string, value: string | undefined) => void
  setStatus: (status: any) => void
  setSubmitting: (isSubmitting: boolean) => void
  setTouched: (touched: NestedStringMap<boolean>, shouldValidate?: boolean | undefined) => any
  setValues: (values: Values, shouldValidate?: boolean | undefined) => any
  submitForm: () => Promise<void | undefined>
  validateForm: (values?: Values) => Promise<NestedStringMap<string>>
  validateField: (name: string) => Promise<void> | Promise<string | undefined>
  isValid: boolean
  dirty: boolean
  unregisterField: (name: string) => void
  registerField: (name: string, { validate }: any) => void
  getFieldProps: (nameOrOptions: any) => FieldInputProps<any>
  getFieldMeta: (name: string) => FieldMetaProps<any>
  getFieldHelpers: (name: string) => FieldHelperProps<any>
  validateOnBlur: boolean
  validateOnChange: boolean
  validateOnMount: boolean
  values: Values
  errors: NestedStringMap<string>
  touched: NestedStringMap<boolean>
  isSubmitting: boolean
  isValidating: boolean
  status?: any
  submitCount: number
  ready: boolean
}

function getOnSubmit<Values>(options: UseFormOptions<Values>, logger: LoggerHook) {
  const { onSubmit, document, notifyOnSuccess, notifyOnError } = options || {}
  if (document) {
    return async (values: Values, form: FormHook<Values>) => {
      try {
        form.setStatus(undefined)
        await document.set(values)

        let hasError = null
        if (onSubmit) {
          const result = await onSubmit(values)

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
  }
  if (onSubmit) {
    return async (values: Values, form: FormHook<Values>) => {
      try {
        const result = await onSubmit(values)

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
  const onSubmitDeps = [options.document, options.onSubmit]
  const onSubmit = useMemo<any>(() => getOnSubmit(options, logger), onSubmitDeps)
  const initialValues: any = options.initialValues || (options.document && options.document.values) || {}
  const formik = useFormik({ ...options, onSubmit, initialValues })
  useConfirmOnLeave(!formik.isSubmitting && formik.dirty)

  if (options.document) {
    options.document.setForm(formik)
  }

  return {
    ...formik,
    document: options.document,
    ready: formik.values && Object.keys(formik.values).length > 0,
  } as any
}
