import React from "react"

import { FileDef } from "./FileInput"
import { Link, LinkStyle } from "./Link"

export interface FileDownloadLinkProps {
  file: FileDef
  noFile?: React.ReactNode
  style?: LinkStyle
}

export function FileDownloadLink(props: FileDownloadLinkProps) {
  const { file, style, noFile = "No file." } = props

  if (!file || !file.url) {
    return <span>{noFile}</span>
  }

  return (
    <Link href={file.url} target="_blank" style={style} download={file.name}>
      {file.name}
    </Link>
  )
}
