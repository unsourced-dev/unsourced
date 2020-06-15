import cc from "classnames"
import React from "react"
import { createPortal } from "react-dom"

import { useOutsideClick } from "../utils/useOutsideClick"
import { Button } from "./Button"
import { Heading } from "./Heading"
import { Icon } from "./Icon"

export const MODAL_ROOT_ID = "modal-root"

export interface ModalProps {
  onClose()
  header?: string
  active?: boolean
  className?: string
  children?: any
}

export function Modal(props: ModalProps) {
  const { onClose, active = true, header, children } = props
  const ref = useOutsideClick(onClose)
  if (!active) {
    return <div />
  }

  const elt = typeof document !== "undefined" && document.getElementById(MODAL_ROOT_ID)
  const result = (
    <div
      className="main-modal fixed w-full h-100 inset-0 z-40 overflow-hidden flex justify-center items-center"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
    >
      <div
        ref={ref}
        className={cc(
          "w-11/12 md:max-w-2xl bg-white rounded opacity-100 z-40 overflow-y-auto max-h-screen",
          props.className
        )}
      >
        {header && (
          <div className="flex justify-between items-center pb-3">
            <Heading level="3">{header}</Heading>
            <Button style="icon" onClick={onClose}>
              <Icon name="close" size="xsmall" />
            </Button>
          </div>
        )}
        {children}
      </div>
    </div>
  )

  return elt ? createPortal(result, elt) : result
}
