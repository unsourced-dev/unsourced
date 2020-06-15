import cc from "classnames"
import React from "react"

import { nano } from "../nanocss"
import { Icon } from "./Icon"
import { Link } from "./Link"
import { Media, MediaDef } from "./Media"

const nameFn = nano.drule({
  "background-repeat": "no-repeat",
  "background-size": "cover",
})

export function getMediaBackground(media: MediaDef) {
  const item = media && media[0]

  if (!item || item.mimeType.startsWith("video")) return ""

  if (!item.srcSet) {
    return nameFn({
      "background-image": "url(" + item.src.url + ")",
    })
  }

  const result: any = {
    "background-image": "url(" + item.src.url + ")",
  }

  let prevWidth: number
  for (const src of item.srcSet) {
    const minWidth = src.width / 2.1
    result[
      `@media only screen and (min-width: ${minWidth.toFixed(0)}px) ${
        prevWidth ? `and (max-width: ${prevWidth.toFixed(0)}px)` : ""
      }`
    ] = {
      "background-image": "url(" + src.url + ")",
    }
    prevWidth = minWidth
  }

  return nameFn(result)
}

//
// -----------------------------------------------------
//

export interface CardProps {
  title: string
  subtitle?: string
  supertitle?: string
  backgroundImage?: MediaDef
  image?: MediaDef
  href?: string
  as?: string
  className?: string
  text?: string
}

export function Card(props: CardProps) {
  const { title, subtitle, supertitle, text, backgroundImage, image, href, as } = props

  // TODO check if this is needed, can we extract to another component???
  const backgroundClass = getMediaBackground(backgroundImage)

  if (href) {
    return (
      <div className={cc("rounded-lg p-2 block mb-2 mr-2 bg-overlay", backgroundClass || "bg-black", props.className)}>
        <Link style="unstyled" href={href} as={as} className="flex flex-col h-full">
          <div className="pt-2">
            {supertitle && <p className="text-xs leading-relaxed">{supertitle}</p>}
            <p className="text-lg font-heading leading-tight font-semibold">{title}</p>
            {subtitle && <p className="text-sm">{subtitle}</p>}
            {text && <p className="text-sm mt-1">{text}</p>}
          </div>
          <div className="my-auto pb-6 mx-auto w-9/12">
            <Media media={image} />
          </div>
          <div className="ml-auto">
            <Icon size="large" name="chevron-right" />
          </div>
        </Link>
      </div>
    )
  }

  return (
    <div
      className={cc("rounded-lg p-2 hover:bg-gray-100 block mb-2 mr-2", backgroundClass || "bg-black", props.className)}
    >
      <div className="pt-2 flex flex-col h-full">
        {supertitle && <p className="text-xs leading-relaxed">{supertitle}</p>}
        <p className="text-lg font-heading leading-tight font-semibold">{title}</p>
        {subtitle && <p className="text-sm">{subtitle}</p>}
        {text && <p className="text-sm mt-1">{text}</p>}
      </div>
      <div className="my-auto pb-6 mx-auto w-9/12">
        <Media media={image} />
      </div>
    </div>
  )
}
