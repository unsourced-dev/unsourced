import { useEffect, useState } from "react"

import { Collection } from "./Collection"
import { Query, QueryCondition, QueryOrderBy } from "./types"

function toString(options: UseCollectionOptions<any>): string {
  let result = options.limit ? String(options.limit) : ""

  if (options.conditions) {
    options.conditions.forEach((cond) => {
      result += "_" + cond.field + " " + cond.operand + " " + String(cond.value)
    })
  }
  if (options.orderBy) {
    options.orderBy.forEach((order) => {
      result += "_" + order.field + " " + order.direction
    })
  }

  return result
}

function getDependencies(collection: Collection<any>, options: UseCollectionOptions<any>): any[] {
  return [collection.path, toString(options)]
}

export interface CollectionHook<T> {
  documents: T[]
  loading: boolean
  error: string | undefined
  hasMore: boolean
  ready: boolean
  fetchMore(count: number)
  options: UseCollectionOptions<T>
  refresh(query?: Query): Promise<void>
}

export interface UseCollectionOptions<T> {
  conditions?: QueryCondition[]
  orderBy?: QueryOrderBy[]
  limit?: number
  documents?: T[]
}

export function useCollection<T>(collection: Collection<T>, options: UseCollectionOptions<T> = {}): CollectionHook<T> {
  const [offset, setOffset] = useState<number>(0)
  const [limit, setLimit] = useState<number>(options.limit || (options.documents && options.documents.length) || 20)
  const [documents, setDocuments] = useState<T[]>(options.documents || [])
  const [fetchedCount, setFetchedCount] = useState<number>(
    options.documents ? options.limit || options.documents.length : 0
  )
  const [loading, setLoading] = useState<boolean>(!options.documents)
  const [error, setError] = useState<string>(undefined)

  const hasMore = documents.length === fetchedCount

  async function fetchStuff(reset: boolean, query: Query) {
    if (!collection) {
      return
    }

    setLoading(true)
    setError(null)
    try {
      const docs = await collection.query(query)
      setDocuments(reset ? docs : documents.concat(docs))
      setFetchedCount(reset ? limit : fetchedCount + limit)
      if (reset) setOffset(0)
      setLoading(false)
    } catch (err) {
      setLoading(false)
      setError(err.message || err)
      if (err.details) {
        console.error("Error: ", err.details, err)
      }
    }
  }

  useEffect(() => {
    if (options.documents && offset === 0 && fetchedCount === limit) {
      return
    }
    fetchStuff(true, options)
  }, getDependencies(collection, options))

  return {
    documents,
    loading,
    error,
    hasMore,
    ready: (!loading || documents.length > 0) && !error,
    fetchMore(count: number): Promise<void> {
      if (!hasMore) return Promise.resolve()
      setOffset(fetchedCount)
      setLimit(count)
      const { conditions, orderBy } = options
      return fetchStuff(false, {
        conditions,
        orderBy,
        offset: fetchedCount,
        limit: count,
      })
    },
    options,
    refresh(query: Query = options) {
      return fetchStuff(true, query)
    },
  }
}
