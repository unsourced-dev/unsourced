import { StringMap } from "../types"

export function getUrlParameters(): StringMap<string> {
  if (typeof window === "undefined") return {}
  const parameters = {}
  window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
    parameters[key] = value
    return ""
  })
  return parameters
}
