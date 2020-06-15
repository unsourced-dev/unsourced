import React from "react"

import { Button, ButtonProps } from "./Button"
import { Modal } from "./Modal"
import { ModalButton } from "./ModalButton"
import { Row } from "./Row"

export interface ConfirmModalProps {
  onClose()
  onClick?(e: any)
  modal?: ConfirmButtonModal
}

export function ConfirmModal(props: ConfirmModalProps) {
  const { onClose, onClick, modal = {} } = props

  async function onConfirm(e) {
    if (onClick) {
      await onClick(e)
    }
    onClose()
  }

  return (
    <Modal className="p-4" onClose={onClose} header={modal.title || "Are you sure?"}>
      <div className="">
        <p>{modal.paragraph || "Are you sure you want to perform this action?"}</p>
        {modal.irreversible && <p className="font-bold">This action is irreversible.</p>}
        <Row align="right" valign="center">
          <Button style="link" onClick={onClose}>
            {modal.cancelButton || "Cancel"}
          </Button>
          <Button style="danger" onClick={onConfirm} className="ml-4">
            {modal.okButton || "OK"}
          </Button>
        </Row>
      </div>
    </Modal>
  )
}

export interface ConfirmButtonModal {
  title?: string
  paragraph?: string
  cancelButton?: string
  okButton?: string
  irreversible?: boolean
}

export interface ConfirmButtonProps extends ButtonProps {
  modal?: ConfirmButtonModal
}

export function ConfirmButton(props: ConfirmButtonProps) {
  const { onClick, modal, ...rest } = props
  return <ModalButton {...rest} modal={ConfirmModal} modalProps={{ onClick, modal }} />
}
