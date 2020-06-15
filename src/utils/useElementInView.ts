import { useEffect, useRef, useState } from "react"

function isElementInViewport(el) {
  if (el.style.display === "none") return false
  var rect = el.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

export function useElementInView() {
  const ref = useRef<any>(null)
  const [isInView, setIsInView] = useState<boolean>(false)

  useEffect(() => {
    const checkInView = () => {
      if (ref.current) {
        const inView = isElementInViewport(ref.current)
        setIsInView(inView)
      }
    }

    window.addEventListener("scroll", checkInView)

    return () => window.removeEventListener("scroll", checkInView)
  }, [ref.current])

  return { ref, isInView }
}
