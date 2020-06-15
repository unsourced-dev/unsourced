import React from "react"

import { Heading } from "./Heading"
import { Link } from "./Link"
import { Row } from "./Row"

export interface TileProps {
  title: string
  subtitle?: string
  href?: string
  as?: string
  onClick?(event: any)
  className?: string
  menu?: React.ReactElement
}

export function Tile(props: TileProps) {
  const { title, subtitle, href, as, onClick, className = "", menu } = props

  const content = (
    <Row align="space-between">
      <div>
        <Heading level="3">{title}</Heading>
        {subtitle && <p className="text-gray-600">{subtitle}</p>}
      </div>
      <Row align="center" valign="center">
        {menu}
      </Row>
    </Row>
  )

  if (href) {
    return (
      <Link
        style="unstyled"
        href={href}
        as={as}
        className={"w-full rounded border border-gray-300 p-2 hover:bg-gray-100 block mb-2 " + className}
      >
        {content}
      </Link>
    )
  }

  if (onClick) {
    return (
      <div
        onClick={onClick}
        className={
          "w-full rounded border border-gray-300 p-2 hover:bg-gray-100 block mb-2 text-left cursor-pointer " + className
        }
      >
        {content}
      </div>
    )
  }

  return <div className={"w-full rounded border border-gray-300 p-2 mb-2 " + className}>{content}</div>
}
