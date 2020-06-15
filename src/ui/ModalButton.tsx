import React from "react"

import { Button, ButtonProps } from "./Button"

const clickHandler = (open: boolean, setOpen: (open: boolean) => void) => (e) => {
  if (e) {
    e.preventDefault()
    e.stopPropagation()
  }
  return setOpen(open)
}

export interface ModalProps {
  onClose()
}

export interface ModalButtonProps extends ButtonProps {
  modal: React.ComponentType<any>
  modalProps?: any
}

export function ModalButton(props: ModalButtonProps) {
  const { modal: Modal, modalProps, ...rest } = props
  const [open, setOpen] = React.useState<boolean>(false)

  return (
    <React.Fragment>
      <Button {...rest} onClick={clickHandler(true, setOpen)} />
      {open && <Modal {...modalProps} onClose={clickHandler(false, setOpen)} />}
    </React.Fragment>
  )
}
