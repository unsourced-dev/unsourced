/**
 * Computes the slug for the given name (works for tags, recipes, pages, ...)
 */
export function computeSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[!"#$%&'()*+,./:;<=>?@[\]^_`{|}~]/g, "")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .trim()
    .replace(/[-\s]+/g, "-")
}
