import cc from "classnames"
import React from "react"

import { Icon, IconName } from "./Icon"
import { Media, MediaDef } from "./Media"

const ICON_WIDTH = 48

export interface MediaIconProps {
  media: MediaDef | string
  rounded?: boolean
  fallback?: IconName
  className?: string
  smaller?: boolean
}

export function MediaIcon(props: MediaIconProps) {
  const { media, rounded, fallback, smaller } = props

  const className = cc("block", rounded && "rounded-full", props.className)

  if (media && (typeof media === "string" || (media.length > 0 && media[0].src))) {
    return (
      <Media
        media={media}
        width={smaller ? 32 : ICON_WIDTH}
        height={smaller ? 32 : ICON_WIDTH}
        className={className}
        objectFit="cover"
        style={{ height: smaller ? "32px" : "48px" }}
      />
    )
  }

  if (fallback) {
    // xlarge = 48px
    return <Icon name={fallback} className={className} size={smaller ? "large" : "xlarge"} />
  }

  return <div />
}
