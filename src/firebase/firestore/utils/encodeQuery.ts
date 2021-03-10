import { Query, QueryCondition, QueryOrderBy } from "../types"
import { encodeValue } from "./encodeValue"

export const DEFAULT_LIMIT = 20

const OPERAND_MAP = {
  "<": "LESS_THAN",
  "<=": "LESS_THAN_OR_EQUAL",
  "==": "EQUAL",
  "!=": "NOT_EQUAL",
  ">=": "GREATER_THAN_OR_EQUAL",
  ">": "GREATER_THAN",
  in: "IN",
  "array-contains": "ARRAY_CONTAINS",
  "array-contains-any": "ARRAY_CONTAINS_ANY",
  "is-nan": "IS_NAN",
  "is-null": "IS_NULL",
}

function getBiggerThanValue(value: string) {
  const next = value.charCodeAt(value.length - 1) + 1
  return value.substr(0, value.length - 1) + String.fromCharCode(next)
}

/**
 * Converts a condition to Firebase's REST API's format.
 *
 * @param condition The condition to convert
 *
 * @returns The condition in Firebase's REST API's format
 *
 * @see https://firebase.google.com/docs/firestore/reference/rest/v1beta1/StructuredQuery#filter
 * @see https://firebase.google.com/docs/firestore/reference/rest/v1beta1/StructuredQuery#fieldfilter
 */
function convertToBodyCondition(condition: QueryCondition): any[] {
  switch (condition.operand) {
    case "is-nan":
    case "is-null":
      return [
        {
          unaryFilter: {
            field: { fieldPath: condition.field },
            op: OPERAND_MAP[condition.operand],
          },
        },
      ]
    case "starts-with":
      if (!condition.value || typeof condition.value !== "string") return []
      const next = getBiggerThanValue(condition.value)
      return [
        [
          {
            fieldFilter: {
              field: { fieldPath: condition.field },
              op: OPERAND_MAP[">="],
              value: encodeValue(condition.value),
            },
          },
          {
            fieldFilter: {
              field: { fieldPath: condition.field },
              op: OPERAND_MAP["<"],
              value: encodeValue(next),
            },
          },
        ],
      ]
    default:
      return [
        {
          fieldFilter: {
            field: { fieldPath: condition.field },
            op: OPERAND_MAP[condition.operand],
            value: encodeValue(condition.value),
          },
        },
      ]
  }
}

const DIRECTIONS = {
  asc: "ASCENDING",
  desc: "DESCENDING",
}

function convertToBodyOrderBy(orderBy: QueryOrderBy): any {
  return {
    field: { fieldPath: orderBy.field },
    direction: DIRECTIONS[orderBy.direction],
  }
}

function getFilters(conditions: QueryCondition[] | undefined): any[] {
  const result = []
  ;(conditions || []).forEach((c) => {
    result.push(...convertToBodyCondition(c))
  })

  return result
}

/**
 *
 * Converts a Query to a body ready to be sent to Firestore's REST API.
 *
 * @param collection The path of the collection to query from
 * @param query The query to execute
 *
 * @returns The body to send to Firestore's REST API
 *
 * @see https://cloud.google.com/firestore/docs/reference/rest/v1/projects.databases.documents/runQuery
 * @see https://developers.google.com/apis-explorer/#search/firestore/firestore/v1/firestore.projects.databases.documents.runQuery
 */
export function encodeQuery(collection: string, query: Query): any {
  return {
    structuredQuery: {
      select: query?.fields && { fields: query.fields.map((fieldPath) => ({ fieldPath })) },
      from: [{ collectionId: collection }],
      where: {
        compositeFilter: {
          op: "AND",
          // this should be done with a flatMap, but next 9 doesn't transpile properly on the server, and Array.flatmap doesn't exists on Node 10...
          // filters: (query.conditions || []).flatMap(convertToBodyCondition),
          filters: getFilters(query.conditions),
        },
      },
      orderBy: (query.orderBy || []).map(convertToBodyOrderBy),
      offset: query.offset || 0,
      limit: query.limit || DEFAULT_LIMIT,
    },
  }
}
