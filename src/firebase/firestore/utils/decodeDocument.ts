import { FetchedDocument } from "../types"

/**
 * Converts the given value from Firestore's REST API Value to a regular javascript object/value.
 *
 * @param value The javascript value to convert
 *
 * @see https://cloud.google.com/firestore/docs/reference/rest/v1/Value
 */
function decode(value: any): any {
  if (value == null || typeof value !== "object") {
    return value
  }

  if ("nullValue" in value) return null
  if ("stringValue" in value) return value.stringValue
  if ("doubleValue" in value) return value.doubleValue
  if ("integerValue" in value) return parseInt(value.integerValue)
  if ("booleanValue" in value) return value.booleanValue
  if ("timestampValue" in value) return new Date(value.timestampValue)
  if ("mapValue" in value) return decode(value.mapValue.fields || {})
  if ("arrayValue" in value) return (value.arrayValue.values || []).map(decode)

  // plain object
  const result: any = {}
  Object.keys(value).forEach((key) => {
    result[key] = decode(value[key])
  })
  return result
}

const DOCS_PATH_SEPARATOR = "/databases/(default)/documents/"

export function decodeDocument<T>(body: any): FetchedDocument & T {
  const { name, fields, createTime, updateTime } = body
  const result: FetchedDocument & T = decode(fields)

  if (!result) {
    return result
  }
  // console.log("Document: ", JSON.stringify(d))
  // ___doc___.name: projects/<FIREBASE_PROJECT>/databases/(default)/documents/<DOCUMENT_PATH>
  const paths: string[] = name.split(DOCS_PATH_SEPARATOR)
  paths.shift()
  const path = paths.join("/")
  const segments = path.split("/")
  const id = segments[segments.length - 1]
  segments.pop()
  const collection = segments.join("/")

  result.___doc___ = {
    id,
    path,
    collection,
    createTime: new Date(createTime),
    updateTime: new Date(updateTime),
  }
  return result
}
