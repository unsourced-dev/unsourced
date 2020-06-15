import { expect } from "chai"

import { encodeValue } from "./encodeValue"

describe("encodeValue", function () {
  it("Works with doted paths", function () {
    const result = encodeValue({
      "nested.object.num": 1,
      "nested.object.str": "test",
      "nested.object.arr": ["a", 2],
      "nested.object.obj.num": 3,
    })

    expect(result).to.deep.equal({
      mapValue: {
        fields: {
          nested: {
            mapValue: {
              fields: {
                object: {
                  mapValue: {
                    fields: {
                      num: {
                        integerValue: "1",
                      },
                      str: {
                        stringValue: "test",
                      },
                      arr: {
                        arrayValue: {
                          values: [
                            {
                              stringValue: "a",
                            },
                            {
                              integerValue: "2",
                            },
                          ],
                        },
                      },
                      obj: {
                        mapValue: {
                          fields: {
                            num: {
                              integerValue: "3",
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })
  })
})
