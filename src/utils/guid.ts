const ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_"
const ALPHABET_FIRST = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
const SIZE = 15
const rand = (alphabet = ALPHABET) => alphabet[Math.floor(Math.random() * alphabet.length)]

/**
 * Function to generate a GUID.
 */
export function guid() {
  return [ALPHABET_FIRST, ...Array(SIZE)].map(rand).join("")
}
