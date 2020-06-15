import { Transform } from "../firebase/firestore/transforms"

export function removeUndefinedFields<T = any>(value: T): T {
  switch (typeof value) {
    case "bigint":
    case "boolean":
    case "function":
    case "number":
    case "string":
    case "symbol":
      return value
    case "object":
      if (value instanceof Transform) {
        return value
      } else if (Array.isArray(value)) {
        return value.filter((v) => v !== undefined).map(removeUndefinedFields) as any
      } else if (!value) {
        return null
      } else {
        const result: any = {}
        Object.keys(value).forEach((key) => {
          if (value[key] !== undefined) {
            result[key] = removeUndefinedFields(value[key])
          }
        })
        return result
      }
    case "undefined":
      throw new Error("Undefined field in value")
  }
  return value
}
