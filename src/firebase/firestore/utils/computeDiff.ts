import { getIn } from "formik"

import { StringMap } from "../../../types"
import { removeUndefinedFields } from "../../../utils/removeUndefinedFields"
import { Transforms } from "../transforms"

function isPrimitiveType(data: any): boolean {
  switch (typeof data) {
    case "bigint":
    case "boolean":
    case "number":
    case "string":
    case "symbol":
    case "undefined":
    case "function":
      return true
    case "object":
      return data === null
  }
  return false
}

// function any(data: any[], condition: (value: any) => boolean): boolean {
//   for (const value of data) {
//     if (condition(value)) {
//       return true
//     }
//   }
//   return false
// }

function all(data: any[], condition: (value: any) => boolean): boolean {
  for (const value of data) {
    if (!condition(value)) {
      return false
    }
  }
  return true
}

function computeDiffForArray(data: any[], previous: any, path: string, result: StringMap<any>) {
  const filtered = data.filter((d) => d !== undefined)

  // if no array before, just set the values.
  if (!Array.isArray(previous)) {
    result[path] = removeUndefinedFields(filtered)
    return
  }

  // Check if the array only contain primitive types
  const isPrimitive = all(filtered, isPrimitiveType)

  // If not, just set.
  if (!isPrimitive) {
    result[path] = removeUndefinedFields(filtered)
    return
  }

  const toAdd: any[] = []
  const toRemove: any[] = []

  for (const value of filtered) {
    if (!previous.includes(value)) {
      toAdd.push(value)
    }
  }
  for (const value of previous) {
    if (value === undefined) continue

    if (!filtered.includes(value)) {
      toRemove.push(value)
    }
  }

  if (toAdd.length > 0 && toRemove.length > 0) {
    result[path] = filtered
    return
  } else if (toAdd.length > 0) {
    result[path] = Transforms.appendToArray(toAdd)
  } else if (toRemove.length > 0) {
    result[path] = Transforms.removeFromArray(toRemove)
  }
}

function concatPaths(path: string, segment: string): string {
  if (!path) return segment

  return path + "." + segment
}

function computeDiffForObject(data: any, previous: any, path: string, result: StringMap<any>) {
  const keys: StringMap<any> = {}
  let keyContainsDots = false
  for (const key of Object.keys(data)) {
    if (key.includes(".")) {
      keyContainsDots = true
      _computeDiff(data[key], getIn(previous, key), concatPaths(path, key), result)
      continue
    }
    const value = data[key]
    if (value === undefined) continue

    keys[key] = true
    _computeDiff(value, previous && previous[key], concatPaths(path, key), result)
  }

  if (!keyContainsDots && previous) {
    for (const key of Object.keys(previous)) {
      const value = previous[key]
      if (keys[key] || value === undefined) continue

      result[concatPaths(path, key)] = null
    }
  }
}

function _computeDiff(data: any, previous: any, path: string = "", result: StringMap<any> = {}) {
  if (data === previous) return
  switch (typeof data) {
    case "bigint":
    case "boolean":
    case "number":
    case "string":
    case "symbol":
      result[path] = data
      return
    case "object": {
      if (!data) {
        // set the data at the given path to null
        result[path] = null
        return
      }
      if (Array.isArray(data)) {
        computeDiffForArray(data, previous, path, result)
        return
      }
      computeDiffForObject(data, previous, path, result)
      return
    }
    case "undefined":
      if (typeof previous !== "undefined") {
        result[path] = null // No transform to delete in the REST API.
      }
      return
    case "function":
      throw new Error("Cannot save a function!")
  }
}

export function computeDiff(data: any, previous: any) {
  const result: any = {}
  _computeDiff(data, previous, "", result)
  return result
}
