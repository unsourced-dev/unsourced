import { tokenize } from "linkifyjs"
import React from "react"

import { Link } from "./Link"

interface ParagraphTokenDef {
  type: "text" | "url"
  value: string
}

function computeParagraphs(text: string): ParagraphTokenDef[][] {
  return text.split("\n").map((row) => {
    return tokenize(row).map((token: any) => {
      return { type: token.type, value: token.toString() }
    })
  })
}

//
// -----------------------------------------------------
//

interface ParagraphTokenProps {
  token: ParagraphTokenDef
}

function ParagraphToken(props: ParagraphTokenProps) {
  const { type, value } = props.token

  switch (type) {
    case "url":
      const href = value.startsWith("http") ? value : "https://" + value
      return (
        <Link href={href} target="_blank">
          {value}
        </Link>
      )
    default:
      return <span>{value}</span>
  }
}

//
// -----------------------------------------------------
//

export interface TextProps {
  value: string
  className?: string
}

export function Text(props: TextProps) {
  const [raw, setRaw] = React.useState<string>(props.value)
  const [paragraphs, setParagraphs] = React.useState<ParagraphTokenDef[][]>(() => computeParagraphs(props.value))
  const className = props.className ? props.className : "mb-2"

  React.useEffect(() => {
    if (props.value !== raw) {
      setParagraphs(computeParagraphs(props.value))
      setRaw(props.value)
    }
  }, [props.value])

  return (
    <React.Fragment>
      {paragraphs.map((paragraph, i) => (
        <p className={className} key={i}>
          {paragraph.map((token, i2) => (
            <ParagraphToken token={token} key={i2} />
          ))}
        </p>
      ))}
    </React.Fragment>
  )
}
