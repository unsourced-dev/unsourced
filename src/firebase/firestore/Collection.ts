import { removeUndefinedFields } from "../../utils/removeUndefinedFields"
import { deleteInCache, getFromCache, setInCache } from "./cache"
import { computeDiff } from "./computeDiff"
import { firestore } from "./firestore"
import { Transform } from "./transforms"
import { FetchedDocument, Query } from "./types"

//
// -----------------------------------------------------
//

export interface Mutation {
  apply(data: any): Promise<any>
  unapply(data: any): Promise<any>
}

export async function apply(data: any, mutations: Mutation[]): Promise<any> {
  let result = data
  for (const mutation of mutations) {
    result = await mutation.apply(result)
  }
  return result
}

export async function unapply(data: any, mutations: Mutation[]): Promise<any> {
  let result = data
  for (const mutation of mutations) {
    result = await mutation.unapply(result)
  }
  return result
}

export type WithTransform<T> = {
  [K in keyof T]: T[K] | Transform | WithTransform<T[K]>
}

//
// -----------------------------------------------------
//

export class Collection<T = any> {
  public mutations: Mutation[]
  constructor(public path: string, ...mutations: Mutation[]) {
    this.mutations = mutations
  }
  getPath(id: string) {
    return this.path + "/" + id
  }

  async get(id: string, force?: boolean): Promise<T & FetchedDocument> {
    if (!force) {
      const cached = getFromCache(this.getPath(id))
      if (cached) {
        return cached
      }
    }
    const raw = await firestore().get(this.getPath(id))
    const result = await apply(raw, this.mutations)
    setInCache(this.getPath(id), result)
    return result
  }
  async set(id: string, data: WithTransform<T>): Promise<T> {
    const toSet = removeUndefinedFields(await unapply(data, this.mutations))
    if (Object.keys(toSet).length === 0) return getFromCache(this.getPath(id))
    const result = await firestore().set(this.getPath(id), toSet)
    const transformed = await apply(result, this.mutations)
    setInCache(this.getPath(id), transformed)
    return transformed
  }
  async update(id: string, data: Partial<WithTransform<T>>): Promise<T> {
    const toSet = removeUndefinedFields(await unapply(data, this.mutations))
    if (Object.keys(toSet).length === 0) return getFromCache(this.getPath(id))
    const result = await firestore().update(this.getPath(id), toSet)
    const transformed = await apply(result, this.mutations)
    setInCache(this.getPath(id), transformed)
    return transformed
  }
  async patch(id: string, data: T, previous?: T): Promise<T> {
    if (!previous) return this.set(id, data)
    const toSet = await unapply(data, this.mutations)
    const prev = await unapply(previous, this.mutations)
    const diff = computeDiff(toSet, prev)
    // console.log("Collection.path()", { id, diff })

    return this.update(id, diff)
  }
  async query(query: Query = {}): Promise<Array<T & FetchedDocument>> {
    const docs = await firestore().query<T>(this.path, query)
    const results = await Promise.all(docs.map((d) => apply(d, this.mutations)))
    results.forEach((r: FetchedDocument) => {
      setInCache(this.getPath(r.___doc___.id), r)
    })
    return results
  }
  async delete(id: string) {
    await firestore().delete(this.getPath(id))
    deleteInCache(this.getPath(id))
  }
}
