import cc from "classnames"
import React from "react"

import { BorderRadius } from "./types"
import { getUnresponsiveFromPropName } from "./utils/unresponsive"

export function getSrcSet(media: MediaItemDef): string | undefined {
  if (!media.srcSet) return undefined
  return media.srcSet.map((s) => s.url + " " + s.width + "w").join(", ")
}

export interface SrcSetItemDef {
  path: string
  name: string
  url: string
  width: number
  height?: number
  size: number
}

export interface MediaItemDef {
  src?: Omit<SrcSetItemDef, "width">
  srcSet?: SrcSetItemDef[]
  mimeType?: string
}

// We always have list of medias, even for single image/video.
export type MediaDef = MediaItemDef[]

function getItem(media: MediaDef | string): MediaItemDef {
  if (typeof media === "string") return { src: { url: media, path: null, size: 0, name: null } }
  return media && media[0]
}

export interface MediaProps {
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down"
  borderRadius?: BorderRadius
  media: MediaDef | string
  className?: string
  width?: string | number
  height?: string | number
  sizes?: string
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  controls?: boolean
  style?: React.CSSProperties
  endTime?: string
  onPlay?(event: any)
}

export function Media(props: MediaProps) {
  const { media, sizes, style, endTime, onPlay } = props

  const item = getItem(media)

  const width = props.width
  const height = props.height
  const className = cc(
    getUnresponsiveFromPropName(props, "objectFit"),
    getUnresponsiveFromPropName(props, "borderRadius"),
    props.className
  )

  if (!item || !item.src || !item.src.url) {
    return <div />
  }

  if (item.mimeType && item.mimeType.startsWith("video/")) {
    const { autoPlay, loop, muted, controls = true } = props

    return (
      <video
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        width={width}
        height={height}
        className={className}
        style={style}
        playsInline
        controls={controls}
        onPlay={onPlay}
      >
        <source src={item.src.url + (endTime ? `#t=0,${endTime}` : "")} type="video/mp4" />
      </video>
    )
  }

  return (
    <img
      className={className}
      src={item.src.url}
      srcSet={getSrcSet(item)}
      alt="Uploaded image"
      height={height}
      width={width}
      sizes={sizes ? sizes : width ? width + "px" : undefined}
      style={style || { height: "inherit" }}
    />
  )
}
