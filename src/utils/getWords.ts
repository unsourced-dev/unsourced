export function getWords(text: string): string[] {
  if (!text) return []
  return text
    .trim()
    .toLowerCase()
    .replace(/(\s|_|\.|-)+/gm, " ")
    .split(" ")
}
