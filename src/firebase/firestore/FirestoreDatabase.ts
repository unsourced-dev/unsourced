import { getAuthHeaders } from "../functions"
import { FetchedDocument, Query, Transform, WithTransform } from "./types"
import { decodeDocument, encodeFields, encodeQuery, isTransform } from "./utils"

//
// -----------------------------------------------------
//

const ROOT_URL = "https://firestore.googleapis.com/v1"

function getQueryUrl(query?: any): string {
  if (!query) return ""
  let result = ""
  Object.keys(query).forEach((key) => {
    const value = query[key]
    if (Array.isArray(value)) {
      value.forEach((val) => {
        result += `&${key}=${encodeURI(String(val))}`
      })
    } else {
      result += `&${key}=${encodeURI(String(query[key]))}`
    }
  })

  return result
}

function getDetailsMessage(details: any) {
  const error = details && details[0] && details[0].error
  if (!error) return null

  return `Error ${error.code}: ${error.message}`
}

function getFields(data: any, path?: string, result: string[] = []): string[] {
  let keyCount = 0
  for (const key of Object.keys(data)) {
    keyCount++
    const keyPath = path ? path + "." + key : key
    const value = data[key]

    if (isTransform(value)) continue

    // if the key has dots in it, it contains an entire object to write.
    if (!key.includes(".") && value && typeof value === "object" && !Array.isArray(value)) {
      result.push(...getFields(value, keyPath))
    } else {
      result.push(keyPath)
    }
  }

  if (path && keyCount === 0) {
    return [path]
  }

  return result
}

//
// -----------------------------------------------------
//

export interface FirestoreDatabaseConfig {
  projectId: string
  apiKey: string
}

export class FirestoreDatabase {
  private root: string
  constructor(public config: FirestoreDatabaseConfig) {
    this.root = "projects/" + config.projectId + "/databases/(default)/documents"
  }

  private getDocumentName(path: string) {
    return this.root + "/" + path
  }

  private getUrl(path: string, action: string = "", query?: any) {
    const normalized = path.startsWith("/") ? path : "/" + path
    const { apiKey } = this.config

    return `${ROOT_URL}/${this.root}${normalized}${action}?key=${apiKey}${getQueryUrl(query)}`
  }

  private async fetch(url: string, init: RequestInit = {}) {
    if (!init.headers) {
      init.headers = await getAuthHeaders(true)
    }

    const result = await fetch(url, init)
    if (!result.ok) {
      try {
        const details = await result.json()

        const message = result.statusText
        const error: any = new Error(`Error ${result.status}: ${message}`)
        error.details = getDetailsMessage(details)
        error.code = result.status
        throw error
      } catch (err) {
        if (err.details) {
          throw err
        }
        err.message = err.message || `Error ${result.status}: ${result.statusText}`
        throw err
      }
    }
    return result.json()
  }

  private async patch<T = any>(
    path: string,
    values: WithTransform<Partial<T>>,
    docExists?: boolean,
    fields?: string[]
  ): Promise<T> {
    const transforms: Transform[] = []
    const encoded = encodeFields(values, transforms)

    if (transforms.length > 0 || (Array.isArray(fields) && fields.length > 40)) {
      const writes: any[] = [
        {
          update: { name: this.getDocumentName(path), fields: encoded },
          updateMask: fields ? { fieldPaths: fields } : undefined,
          currentDocument: docExists ? { exists: true } : undefined,
        },
      ]
      if (transforms.length > 0) {
        writes.push({
          transform: {
            document: this.getDocumentName(path),
            fieldTransforms: transforms.map((t) => t.__encodedTransform),
          },
        })
      }
      const url = this.getUrl("", ":commit")
      await this.fetch(url, {
        method: "POST",
        body: JSON.stringify({ writes }),
      })
      return this.get(path)
    }

    const query: any = {}
    if (typeof docExists === "boolean") {
      query["currentDocument.exists"] = docExists
    }
    if (Array.isArray(fields)) {
      query["updateMask.fieldPaths"] = fields
    }
    const url = this.getUrl(path, "", query)
    const result = await this.fetch(url, {
      method: "PATCH",
      body: JSON.stringify({ fields: encoded }),
    })
    return decodeDocument(result)
  }

  async get<T = any>(path: string, throwErrorOnNotFound?: boolean): Promise<T & FetchedDocument> {
    try {
      const doc = await this.fetch(this.getUrl(path))
      return decodeDocument<T>(doc)
    } catch (err) {
      if (err.code === 404 && !throwErrorOnNotFound) {
        return undefined
      }
      throw err
    }
  }

  async query<T = any>(path: string, query: Query = {}): Promise<Array<T & FetchedDocument>> {
    const pathArr = path.split("/")
    const last = pathArr.pop()
    const result = await this.fetch(this.getUrl(pathArr.join("/"), ":runQuery"), {
      method: "post",
      body: JSON.stringify(encodeQuery(last, query)),
    })

    return result
      .map((item) => {
        // document not set if no results
        const { document } = item
        const result = document && decodeDocument<T>(document)
        return result
      })
      .filter((doc) => !!doc)
  }

  set<T = any>(path: string, doc: WithTransform<T>): Promise<T> {
    return this.patch<T>(path, doc)
  }

  update<T = any>(path: string, doc: WithTransform<Partial<T>>): Promise<T> {
    if (Object.keys(doc).length === 0) return this.get(path)
    return this.patch(path, doc, true, getFields(doc))
  }

  async delete(path: string): Promise<void> {
    await this.fetch(this.getUrl(path), { method: "DELETE" })
  }
}
