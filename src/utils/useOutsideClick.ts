import { MutableRefObject, useCallback, useEffect, useRef } from "react"

// See https://medium.com/p/25dbaa30abcd/responses/show
// See https://codesandbox.io/s/8484x6zpnj

/**
 * Use this to detect the click outside of a component.
 * Useful for all sorts of dropdowns or modals to close when clicked outside.
 *
 * See `ui/TagListInput.tsx` for an example use.
 */
export function useOutsideClick(onClick: () => any): MutableRefObject<any> {
  const ref = useRef(null)

  const handleClick = useCallback(
    (e) => {
      const outside = !ref.current || !ref.current.contains(e.target)
      if (!outside) return
      onClick()
    },
    [onClick, ref.current]
  )

  useEffect(() => {
    document.addEventListener("mouseup", handleClick)

    return () => document.removeEventListener("mouseup", handleClick)
  }, [handleClick])

  return ref
}
