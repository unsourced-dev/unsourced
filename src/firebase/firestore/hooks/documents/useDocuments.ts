import eq from "fast-deep-equal"
import { getIn, setIn } from "formik"
import { Reducer, useEffect, useReducer, useRef } from "react"

import { StringMap } from "../../../../types"
import { isPromise } from "../../../../utils/isPromise"
import { Collection } from "../../Collection"

//
// -----------------------------------------------------
//

interface State {
  ids: StringMap<string>
  values: any
  loading: boolean
  error: string | undefined
  exists: boolean
  ready: boolean
}

const empty: State = {
  ids: {},
  values: undefined,
  loading: true,
  error: undefined,
  exists: false,
  ready: false,
}

type Action =
  | { type: "fetch"; ids: StringMap<string> }
  | { type: "success"; data: any }
  | { type: "not-found"; data: OnNotFoundResult }
  | { type: "error"; error: any }
  | { type: "set-ready"; ready: boolean }
  | { type: "set-values"; values: any }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "fetch":
      return {
        ...state,
        ids: action.ids,
        loading: true,
        ready: false,
        error: undefined,
      }
    case "not-found":
      return {
        loading: false,
        ids: action.data.ids || state.ids,
        error: action.data.error,
        values: action.data.values,
        ready: false,
        exists: false,
      }
    case "success":
      return {
        loading: false,
        ids: state.ids,
        error: action.data.error,
        values: action.data.values,
        ready: false,
        exists: true,
      }
    case "error":
      return {
        ...state,
        loading: false,
        error: action.error,
        ready: false,
      }
    case "set-ready":
      return { ...state, ready: action.ready }
    case "set-values":
      return { ...state, values: action.values, exists: true, ready: false }
    default:
      return state
  }
}

function defaultOnNotFound(ids: StringMap<string>): OnNotFoundResult<any> {
  return { ids, values: undefined }
}

function getIds(docs: Docs) {
  const result: any = {}
  for (const key of Object.keys(docs)) {
    result[key] = docs[key][1]
  }
  return result
}

function getInitialState<T>(docs: Docs, options: UseDocumentsOptions<T>) {
  return {
    ids: options.values && getIds(docs),
    values: options.values,
    loading: !options.values,
    error: undefined,
    exists: !!options.values,
    ready: !!options.values,
  }
}

function getDocsDeps(docs: Docs): string[] {
  const result: string[] = []

  for (const key of Object.keys(docs)) {
    const [coll, id] = docs[key]
    result.push(key, coll.path, id)
  }
  return result
}

async function fetchDocuments<T>(docs: Docs, force: boolean): Promise<{ values: T; ids: StringMap<string> }> {
  let values: any = {}
  let notFound = false
  const ids: StringMap<string> = {}
  await Promise.all(
    Object.keys(docs).map(async (key) => {
      const [coll, id] = docs[key]
      ids[key] = id
      const doc = await coll.get(id, force)
      values = setIn(values, key, doc)
      if (typeof doc === "undefined") {
        notFound = true
      }
    })
  )

  return notFound ? undefined : { values, ids }
}

function isReady(loading: boolean, error: string | undefined, form: DocumentFormHook | undefined) {
  if (loading || error) return false
  if (!form) return true
  if (!form.values || typeof form.values !== "object") return false
  return Object.keys(form.values).length > 0
}

export interface ResetFormPayload {
  values: any
}

export interface DocumentFormHook {
  setValues(values: any)
  resetForm(payload: ResetFormPayload)
  values: any
}

export interface OnNotFoundResult<T = any> {
  ids?: StringMap<string>
  values?: T
  error?: string
}

export interface SetDocumentPayload<T> {
  ids: StringMap<string>
  values: Partial<T>
  exists: boolean
}

export interface SetDocument<T> {
  (values: Partial<T>): Promise<T>
}

export interface UseDocumentsOptions<T> {
  values?: T
  onNotFound?(ids: StringMap<string>): OnNotFoundResult<T> | Promise<OnNotFoundResult<T>>
  set?(payload: SetDocumentPayload<T>, doSet: SetDocument<T>): Promise<any>
  createNew?: boolean
  // When set to true, patches the data on set instead of just setting.
  patch?: boolean
}

export interface DocumentsHook<T> {
  values: T | undefined
  loading: boolean
  error: string | undefined
  ready: boolean
  exists: boolean
  set(document: Partial<T>): Promise<void>
  setForm(form: DocumentFormHook): void
  refresh(): Promise<T | undefined>
}

export interface Docs {
  [key: string]: [Collection<any>, string]
}

export function useDocuments<T>(docs: Docs, options: UseDocumentsOptions<T> = {}): DocumentsHook<T> {
  const [state, dispatch] = useReducer<Reducer<State, Action>, State>(reducer, empty, () =>
    getInitialState(docs, options)
  )
  const formHook = useRef<DocumentFormHook>(null)

  async function fetchDoc(force: boolean) {
    const ids = getIds(docs)
    dispatch({ type: "fetch", ids })
    try {
      const fetched = await fetchDocuments<T>(docs, force)
      if (!eq(getIds(docs), ids)) {
        return undefined
      }

      if (!fetched) {
        const onNotFound = options.onNotFound || defaultOnNotFound
        let result = onNotFound(ids)
        if (isPromise(result)) {
          result = await result
        }

        dispatch({ type: "not-found", data: result })
        if (formHook.current && result.values) {
          const { values } = result
          formHook.current.setValues(values)
        }
        return result.values
      } else {
        dispatch({ type: "success", data: fetched })
        if (formHook.current) {
          const { values } = fetched
          formHook.current.resetForm({ values })
        }
        return fetched.values
      }
    } catch (error) {
      dispatch({ type: "error", error: error.message || error })
      console.error(`Error while fetching documents ${JSON.stringify(ids)}`, error)
      return undefined
    }
  }

  async function doSet(data: Partial<T>): Promise<T> {
    const updates = await Promise.all(
      Object.keys(docs).map(async (key) => {
        const [coll] = docs[key]
        const id = state.ids[key]
        const updated = getIn(data, key)
        const old = getIn(state.values, key)
        // console.log("doSet() ", { key, id, patch: options.patch, exists: state.exists, old, updated })
        if (state.exists && (updated === undefined || old === updated)) {
          return [key, old]
        }

        if (state.exists && old && options.patch) {
          // console.log("doSet() patching...")
          const result = await coll.patch(id, updated, old)
          return [key, result]
        } else {
          // console.log("doSet() setting...")
          const result = await coll.set(id, updated)
          return [key, result]
        }
      })
    )

    let result: any = state.values
    for (const [key, value] of updates) {
      result = setIn(result, key, value)
    }
    return result
  }

  useEffect(() => {
    const ids = getIds(docs)
    if (eq(state.ids, ids)) {
      if (options.values && formHook.current) {
        const { values } = options
        formHook.current.resetForm({ values })
      }
      return
    }

    effect()

    async function effect() {
      if (options.createNew) {
        const onNew = options.onNotFound || defaultOnNotFound
        let result = onNew(ids)
        if (isPromise(result)) {
          result = await result
        }
        dispatch({ type: "not-found", data: result })
        if (formHook.current && result.values) {
          const { values } = result
          console.log("Setting values: ", values)
          formHook.current.resetForm({ values })
        }
        return
      }

      return fetchDoc(false)
    }
  }, getDocsDeps(docs))

  useEffect(() => {
    const newReady = isReady(state.loading, state.error, formHook.current)
    if (state.ready !== newReady) {
      dispatch({ type: "set-ready", ready: newReady })
    }
  }, [state.loading, state.error, state.values])

  const { error, exists, loading, ready, values } = state
  return {
    error,
    exists,
    loading,
    ready,
    values,
    refresh() {
      return fetchDoc(true)
    },
    set: async (values) => {
      if (loading || error) {
        throw new Error("Document not ready yet!")
      }

      let actualValues: T
      if (options.set) {
        await options.set({ ids: state.ids, values, exists }, async (values) => {
          actualValues = await doSet(values)
          return actualValues
        })
      } else {
        actualValues = await doSet(values)
      }

      // doSet always return ALL the documents, even the documents that were not part of the submit
      dispatch({ type: "set-values", values: actualValues })
      if (formHook.current) {
        formHook.current.resetForm({ values: actualValues })
      }
    },
    setForm(form) {
      formHook.current = form
    },
  }
}
