import { Reducer, useEffect, useReducer, useRef } from "react"

import { Collection } from "../../Collection"

//
// -----------------------------------------------------
//

interface State {
  id: string
  values: any
  loading: boolean
  error: string | undefined
  exists: boolean
  ready: boolean
}

const empty: State = {
  id: "",
  values: undefined,
  loading: true,
  error: undefined,
  exists: false,
  ready: false,
}

type Action =
  | { type: "fetch"; id: string }
  | { type: "success"; data: any }
  | { type: "not-found"; data: OnNotFoundResult }
  | { type: "error"; error: string }
  | { type: "set-ready"; ready: boolean }
  | { type: "set-values"; values: any }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "fetch":
      return {
        ...state,
        id: action.id,
        loading: true,
        ready: false,
        error: undefined,
      }
    case "not-found":
      return {
        loading: false,
        id: action.data.id || state.id,
        error: action.data.error,
        values: action.data.values,
        ready: false,
        exists: false,
      }
    case "success":
      return {
        loading: false,
        id: state.id,
        error: undefined,
        values: action.data,
        ready: false,
        exists: false,
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

function defaultOnNotFound(id: string): OnNotFoundResult<any> {
  return { id, values: undefined }
}

function getInitialState<T>(id: string, options: UseDocumentOptions<T>) {
  return {
    id: options.values && id,
    values: options.values,
    loading: !options.values,
    error: undefined,
    exists: !!options.values,
    ready: !!options.values,
  }
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
  id?: string
  values?: T
  error?: string
}

export interface SetDocumentPayload<T> {
  id: string
  values: T
  exists: boolean
}

export interface SetDocument<T> {
  (values: T): Promise<T>
}

export interface UseDocumentOptions<T> {
  values?: T
  onNotFound?(id: string): OnNotFoundResult<T>
  set?(payload: SetDocumentPayload<T>, doSet: SetDocument<T>): Promise<any>
  createNew?: boolean
  // When set to true, patches the data on set instead of just setting.
  patch?: boolean
}

export interface DocumentHook<T> {
  values: T | undefined
  loading: boolean
  error: string | undefined
  ready: boolean
  exists: boolean
  set(document: T): Promise<void>
  setForm(form: DocumentFormHook): void
  refresh(): Promise<void>
}

export function useDocument<T>(
  collection: Collection<T>,
  id: string,
  options: UseDocumentOptions<T> = {}
): DocumentHook<T> {
  const [state, dispatch] = useReducer<Reducer<State, Action>, State>(reducer, empty, () =>
    getInitialState(id, options)
  )
  const formHook = useRef<DocumentFormHook>(null)

  async function fetchDoc(force: boolean) {
    dispatch({ type: "fetch", id })
    try {
      const fetchingId = id
      const values = await collection.get(id, force)
      if (id !== fetchingId) {
        return
      }

      if (!values) {
        const onNotFound = options.onNotFound || defaultOnNotFound
        const result = onNotFound(id)

        dispatch({ type: "not-found", data: result })
        if (formHook.current && result.values) {
          const { values } = result
          formHook.current.resetForm({ values })
        }
      } else {
        dispatch({ type: "success", data: values })
        if (formHook.current) {
          formHook.current.resetForm({ values })
        }
      }
    } catch (error) {
      dispatch({ type: "error", error: error.message || error })
      console.error(`Error while fetching document at path ${collection.getPath(id)}`, error)
    }
  }

  useEffect(() => {
    if (id === state.id) {
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
        const result = onNew(id)
        dispatch({ type: "not-found", data: result })
        if (formHook.current && result.values) {
          const { values } = result
          formHook.current.resetForm({ values })
        }
        return
      }

      return fetchDoc(false)
    }
  }, [id])

  async function doSet(values: any) {
    if (state.exists && options.patch) {
      return collection.patch(id, values, state.values)
    }
    return collection.set(id, values)
  }

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
        await options.set({ id, values, exists }, async (values) => {
          actualValues = await doSet(values)
          return actualValues
        })
      } else {
        actualValues = await doSet(values)
      }

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
