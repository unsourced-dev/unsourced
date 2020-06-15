import { SelectOption } from "../ui/Select"
import { getWords } from "./getWords"

export function filterSelectOptions<T extends string = string>(
  options: SelectOption<T>[],
  text: string
): SelectOption<T>[] {
  if (!text) return options

  const lower = text.toLocaleLowerCase()
  const words = getWords(text)

  return options.filter((option) => {
    const text = (option.label || option.value).toLocaleLowerCase()
    if (text.includes(lower)) {
      return true
    }

    const optionWords = getWords(text)

    for (const word of words) {
      if (optionWords.includes(word)) {
        return true
      }
    }

    return false
  })
}
