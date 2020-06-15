import cc from "classnames"
import React from "react"

import { Button } from "./Button"
import { ConfirmButton, ConfirmButtonModal } from "./ConfirmButton"
import { Icon } from "./Icon"
import { Link } from "./Link"

function getDeleteBtn(props: TagProps) {
  const { onDelete, onDeleteModal, tag, index } = props
  if (!onDelete) return null

  if (onDeleteModal) {
    return (
      <ConfirmButton
        className="inline-block ml-2 hover:text-red-700"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onDelete(tag, index)
        }}
        modal={onDeleteModal}
        style="unstyled"
      >
        <Icon name="close" size="xsmall" className="fill-current" />
      </ConfirmButton>
    )
  }

  return (
    <button
      className="inline-block ml-2 hover:text-red-700"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onDelete(tag, index)
      }}
      type="button"
    >
      <Icon name="close" size="xsmall" className="fill-current" />
    </button>
  )
}

export interface TagDef {
  label: string
}

export interface TagProps {
  index: number
  tag: TagDef | string
  onClick?(tag: any, index: number, e: React.MouseEvent)
  href?: any
  as?: any
  onDelete?(tag: any, index: number)
  onDeleteModal?: ConfirmButtonModal
  className?: string
  colors?: string
  textClassName?: string
}

export function Tag(props: TagProps) {
  const { index, tag, onClick, href, as, colors } = props

  // all: "text-white font-bold py-2 px-4 rounded inline-block",
  // enabled: "bg-blue-600 hover:bg-blue-800 focus:shadow-outline",
  // disabled: "bg-blue-400 cursor-not-allowed",

  const deleteBtn = getDeleteBtn(props)

  const className = cc(
    "inline-flex items-center rounded-md text-sm mr-2 py-1 px-2",
    {
      "bg-gray-200": !colors,
      "hover:bg-gray-400": !colors && (href || onClick),
    },
    colors,
    props.className
  )

  if (href) {
    return (
      <Link style="unstyled" href={href} as={as} className={className}>
        {typeof tag === "string" ? tag : tag.label}
        {deleteBtn}
      </Link>
    )
  }

  if (onClick) {
    return (
      <Button style="unstyled" onClick={(e) => onClick(tag, index, e)} className={className}>
        {typeof tag === "string" ? tag : tag.label}
        {deleteBtn}
      </Button>
    )
  }

  return (
    <div className={className}>
      {typeof tag === "string" ? tag : tag.label}
      {deleteBtn}
    </div>
  )
}
