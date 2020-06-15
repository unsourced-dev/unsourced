import React from "react"

import { Text } from "./Text"

interface TruncatedTextProps {
  value: string
  maxCharacters?: number
  className?: string
  readMoreClassName?: string
}

export function TruncatedText(props: TruncatedTextProps) {
  const { value, maxCharacters = 240, className, readMoreClassName } = props
  const truncatedText = value.length > maxCharacters ? value.slice(0, maxCharacters) + "…" : value

  const [fullText, setFullText] = React.useState(false)

  return (
    <div>
      <Text className={className} value={fullText ? value : truncatedText} />
      {value.length > maxCharacters && !fullText && (
        <div className={readMoreClassName} onClick={() => setFullText(true)}>
          Read More
        </div>
      )}
    </div>
  )
}
