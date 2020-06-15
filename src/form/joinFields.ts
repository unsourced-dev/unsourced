export function joinFields(prefix: string | null, name: string | null): string {
  if (prefix) {
    if (name) {
      return prefix + "." + name
    } else {
      return prefix
    }
  } else if (name) {
    return name
  } else {
    throw new Error("Name or prefix must be set.")
  }
}
