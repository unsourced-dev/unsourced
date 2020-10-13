import cc from "classnames"
import React from "react"

import { BorderRadius } from "./types"
import { getUnresponsiveFromPropName } from "./utils/unresponsive"

export interface ImageProps {
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down"
  borderRadius?: BorderRadius
  height?: string | number
  width?: string | number
  src: string
  alt?: string
  className?: string
  caption?: string
}

export function Image(props: ImageProps) {
  const { height, width, src, alt, caption } = props
  const className = cc(
    getUnresponsiveFromPropName(props, "objectFit"),
    getUnresponsiveFromPropName(props, "borderRadius"),
    props.className
  )

  if (!src) return <div />

  if (caption) {
    return (
      <figure>
        <img className={className} src={src} alt={alt} />
        {caption && <figcaption className="my-2 text-center text-gray-700">{caption}</figcaption>}
      </figure>
    )
  }

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      height={height}
      width={width}
      style={height && !width ? undefined : { height: "inherit" }}
    />
  )
}
