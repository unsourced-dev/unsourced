import { StringMap } from "../types"
import { getWords } from "./getWords"

const MIN_LENGTH = 3

export function computeKeywords(words: string[]): string[] {
  const wordMap: StringMap<true> = {}

  for (const word of words) {
    const start = word.split("@")[0]
    for (const item of getWords(start)) {
      if (item.length && item.length <= MIN_LENGTH) {
        wordMap[item] = true
      }
      for (let length = MIN_LENGTH; length <= item.length; length++) {
        wordMap[item.substr(0, length)] = true
      }
    }
  }

  return Object.keys(wordMap)
}
