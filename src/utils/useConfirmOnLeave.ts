import Router from "next/router"
import { useEffect } from "react"

let index = 0

export function useConfirmOnLeave(
  unsavedChanges: boolean,
  message = "Are you sure you want to leave? You may lose some changes."
) {
  useEffect(() => {
    if (unsavedChanges) {
      index++
      // const _index = index
      // console.log("useConfirmOnLeave() adding listeners " + _index)
      const routeChangeStart = (url) => {
        if (Router.asPath !== url && !confirm(message)) {
          Router.events.emit("routeChangeError")
          Router.replace(Router, Router.asPath)
          throw "Abort route change. Please ignore this error."
        }
      }
      const beforeunload = (e) => {
        e.preventDefault()
        e.returnValue = message
        return message
      }

      window.addEventListener("beforeunload", beforeunload)
      Router.events.on("routeChangeStart", routeChangeStart)

      return () => {
        // console.log("useConfirmOnLeave() removing listeners " + _index)
        window.removeEventListener("beforeunload", beforeunload)
        Router.events.off("routeChangeStart", routeChangeStart)
      }
    }
    return undefined
  }, [unsavedChanges])
}
