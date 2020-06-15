import { useState } from "react"

import { Collection } from "../../Collection"
import { QueryCondition, QueryOrderBy } from "../../types"
import { useCollection } from "../collection/useCollection"

export interface UseSearchPayload<Values> {
  collection: Collection<Values>
  getConditionsForText(text: string): QueryCondition[] | undefined
  orderBy?: QueryOrderBy[]
  onSearch?(): void
}

export interface SearchHook<Values = any> {
  search(): Promise<void>
  handleTextChange(e: any)
  setText(text: string)
  text: string
  documents: Values[]
  ready: boolean
  loading: boolean
  error: string | undefined
  hasMore: boolean
  fetchMore(count: number): Promise<void>
  refresh(): Promise<void>
}

export function useSearch<Values = any>(payload: UseSearchPayload<Values>): SearchHook<Values> {
  const { getConditionsForText, orderBy } = payload
  const [text, setText] = useState<string>("")
  const [conditions, setConditions] = useState<QueryCondition[]>(() => getConditionsForText(text))
  const collection = useCollection<Values>(payload.collection, { conditions, orderBy })
  const { documents, error, ready, loading, hasMore, fetchMore, refresh } = collection

  return {
    search: async () => {
      const conditions = getConditionsForText(text)
      setConditions(conditions)
      await collection.refresh({ conditions, orderBy })
      if (payload.onSearch) {
        payload.onSearch()
      }
    },
    documents,
    handleTextChange(e) {
      setText(e.target.text)
    },
    hasMore,
    fetchMore,
    setText,
    refresh,
    text,
    loading,
    error,
    ready,
  }
}
