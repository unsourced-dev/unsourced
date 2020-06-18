import { expect } from "chai"

import { computeDiff } from "./computeDiff"

describe("computeDiff", function () {
  it("Works with nested objects and simple values", function () {
    const result = computeDiff(
      {
        // nest everything to test objects.
        obj: {
          // new
          newStr: "Val",

          // updated
          str: "New Value",
          num: 4,

          // same
          strSame: "Old Value",
        },
      },
      {
        // nest everything to test objects.
        obj: {
          // deleted
          oldStr: "Val",

          // updated
          str: "Old Value",
          num: 1,

          // same
          strSame: "Old Value",
        },
      }
    )

    expect(result).to.deep.equal({
      "obj.newStr": "Val",
      "obj.str": "New Value",
      "obj.num": 4,
      "obj.oldStr": null,
    })
  })
  it("Works for deeply nested objects", function () {
    const result = computeDiff({ a: { b: { c: { d: true } } } }, { a: { b: { c: { d: false } } } })

    // console.log(JSON.stringify(result, null, 2))
    expect(result).to.deep.eq({ "a.b.c.d": true })
  })
  it("Works with keys that contains dots", function () {
    const result = computeDiff(
      {
        "object.nested": ["a", "b"],
      },
      {
        object: {
          nested: ["a"],
        },
      }
    )

    // console.log(JSON.stringify(result))
    expect(result).to.deep.equal({
      "object.nested": {
        type: "appendToArray",
        encoded: { appendMissingElements: { values: [{ stringValue: "b" }] } },
      },
    })
  })
})
