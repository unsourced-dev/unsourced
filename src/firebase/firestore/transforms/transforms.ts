import { encodeValue } from "../utils"

function isNumber(v) {
  return typeof v === "number" && !isNaN(v - v)
}

type validator = (v: any) => boolean

interface TransformsMap {
  [key: string]: [string, validator?]
}

const transformsMap: TransformsMap = {
  serverTimestamp: ["setToServerValue"],
  increment: ["increment", isNumber],
  max: ["maximum", isNumber],
  min: ["minimum", isNumber],
  appendToArray: ["appendMissingElements", Array.isArray],
  removeFromArray: ["removeAllFromArray", Array.isArray],
}

export type TransformType =
  /** Is replaced by the server with the time the request was processed */
  | "serverTimestamp"
  /** The server will increment this field by the given amount */
  | "increment"
  /** Sets the field to the minimum of its current value and the given value */
  | "min"
  /** Sets the field to the maximum of its current value and the given value */
  | "max"

  /**
   * Append the given elements in order if they are not already
   * present in the current field value. If the field is not an array, or if the
   * field does not yet exist, it is first set to the empty array.
   */
  | "appendToArray"
  /**
   * Remove all of the given elements from the array in
   * the field. If the field is not an array, or if the field does not yet exist,
   * it is set to the empty array.
   */
  | "removeFromArray"

export class Transform {
  // the piece of JSON that gets sent to firebase as part of the request.
  public encoded: any = {}

  constructor(public type: TransformType, value?: number | any[]) {
    if (!(type in transformsMap)) throw Error(`Invalid transform name: "${type}"`)
    const [transformName, validator] = transformsMap[type]

    if (validator && !validator(value))
      throw Error(
        `The value for the transform "${type}" needs to be a${validator === isNumber ? " number" : "n array"}.`
      )

    if (validator === Array.isArray) this.encoded[transformName] = encodeValue(value).arrayValue
    else this.encoded[transformName] = name === "serverTimestamp" ? "REQUEST_TIME" : encodeValue(value)
  }
}

export const Transforms = {
  serverTimestamp() {
    return new Transform("serverTimestamp")
  },
  increment(value: number) {
    return new Transform("increment", value)
  },
  min(value: number) {
    return new Transform("min", value)
  },
  may(value: number) {
    return new Transform("max", value)
  },
  appendToArray(values: any[]) {
    return new Transform("appendToArray", values)
  },
  removeFromArray(values: any[]) {
    return new Transform("removeFromArray", values)
  },
}
