import React from "react"

import { useFormFromContext } from "../form"
import { useLogger } from "../utils/logger/useLogger"
import { Button, ButtonStyle } from "./Button"

export interface SubmitButtonProps {
  style?: ButtonStyle
  children?: any
  ariaLabel?: string
  tabIndex?: number
  className?: string
  disabled?: boolean
}

export function SubmitButton(props: SubmitButtonProps) {
  const { disabled, ...rest } = props
  const form = useFormFromContext()
  const logger = useLogger()
  return (
    <Button
      {...rest}
      type="submit"
      disabled={disabled || form.isSubmitting || logger.loading}
      loading={form.isSubmitting}
    />
  )
}
