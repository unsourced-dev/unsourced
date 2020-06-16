import { setIn } from "formik"

import { Transform } from "../types"

function canBeConvertedToValue(data: any): boolean {
  switch (typeof data) {
    case "undefined":
    case "function":
    case "symbol":
      return false
    default:
      return true
  }
}

function appendToPath(path: string, segment: string | number): string {
  if (!path) return String(segment)
  return path + "." + segment
}

export function isTransform(data: any): data is Transform {
  return data && typeof data.__encodedTransform === "object"
}

/**
 * Converts the given javascript value (string, boolean, object, array...) to a value that can be sent to Firestore's REST API.
 *
 * @param value The javascript value to convert
 *
 * @see https://cloud.google.com/firestore/docs/reference/rest/v1/Value
 */
export function encodeValue(data: any, transforms?: Transform[], path: string = ""): any {
  if (isTransform(data)) {
    data.__encodedTransform.fieldPath = path
    if (transforms) {
      transforms.push(data)
    }
    return undefined
  }

  switch (typeof data) {
    case "bigint":
      return { integerValue: data.toString() }
    case "boolean":
      return { booleanValue: data }
    case "function":
      throw new Error("Got a function to convert")
    case "number":
      if (Number.isInteger(data)) {
        return { integerValue: data.toString() }
      }
      return { doubleValue: data }
    case "object":
      if (data === null) {
        return { nullValue: null }
      }
      if (Array.isArray(data)) {
        return {
          arrayValue: {
            values: data
              .map((value, i) => encodeValue(value, transforms, appendToPath(path, i)))
              .filter(canBeConvertedToValue),
          },
        }
      }
      return { mapValue: { fields: encodeFields(data, transforms) } }
    case "string":
      return { stringValue: data }
    case "symbol":
    case "undefined":
      return undefined
  }
}

/**
 * Converts the content of the given document to be sendable to Firestore's PATCH REST API.
 *
 * @param document The document to convert
 *
 * @see https://cloud.google.com/firestore/docs/reference/rest/v1/projects.databases.documents#Document
 */
export function encodeFields(document: any, transforms?: Transform[]): any {
  let result: any = {}
  Object.keys(document).forEach((key) => {
    if (key === "___doc___") {
      return
    }

    const value = encodeValue(document[key], transforms, key)
    if (value !== undefined) {
      if (key.includes(".")) {
        const segments = key.split(".")
        const path = segments.map((segment, i) => (i === 0 ? segment : "mapValue.fields." + segment)).join(".")
        result = setIn(result, path, value)
      } else {
        result[key] = value
      }
    }
  })
  return result
}
