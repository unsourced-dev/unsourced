import { useEffect, useState } from "react"

function getWindowSize() {
  if (typeof window === "undefined") {
    // render for mobile
    return { width: 400, height: 800 }
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

export function useWindowSize(): { width: number; height: number } {
  const [windowSize, setWindowSize] = useState(getWindowSize)

  useEffect(() => {
    const onResize = () => setWindowSize(getWindowSize())
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  })

  return windowSize
}
