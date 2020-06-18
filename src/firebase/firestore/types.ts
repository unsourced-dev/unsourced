export type QueryOperand =
  | "<"
  | "<="
  | "=="
  | ">="
  | ">"
  | "array-contains"
  | "is-nan"
  | "is-null"
  | "starts-with"
  | "in"
  | "array-contains-any"

export interface QueryCondition {
  field: string
  operand: QueryOperand
  value?: any
}

export type QueryOrderByDirection = "asc" | "desc"

export interface QueryOrderBy {
  field: string
  direction: QueryOrderByDirection
}

export interface Query {
  conditions?: QueryCondition[]
  orderBy?: QueryOrderBy[]
  offset?: number
  limit?: number
}

export interface FetchedDocumentInfo {
  id: string
  path: string
  collection: string
  createTime: Date
  updateTime: Date
}

export type FetchedDocument = {
  ___doc___: FetchedDocumentInfo
}

export interface Transform {
  /** The encoded transformation to send firebase. */
  __encodedTransform: any
}

export type WithTransform<T> = {
  [K in keyof T]: T[K] | Transform | WithTransform<T[K]>
}

export interface ResetFormPayload {
  values: any
}

export interface DocumentFormHook {
  setValues(values: any)
  resetForm(payload: ResetFormPayload)
  values: any
}
