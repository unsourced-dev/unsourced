import { StringMap } from "../../types"

//
// -----------------------------------------------------
//

export function getWords(text: string): string[] {
  if (!text) return []
  return text
    .trim()
    .toLowerCase()
    .replace(/(\s|_|\.|-)+/gm, " ")
    .split(" ")
}

//
// -----------------------------------------------------
//

const MIN_LENGTH = 3

export function computeKeywords(words: string[], minWordLength: number = MIN_LENGTH): string[] {
  const wordMap: StringMap<true> = {}

  for (const word of words) {
    const start = word.split("@")[0]
    for (const item of getWords(start)) {
      if (item.length && item.length <= minWordLength) {
        wordMap[item] = true
        wordMap[item.substr(0, item.length - 1)] = true
      }
      for (let length = minWordLength; length <= item.length; length++) {
        wordMap[item.substr(0, length)] = true
      }
      if (item.length > 0) {
        wordMap[item.substr(1)] = true
      }
    }
  }

  return Object.keys(wordMap)
}
