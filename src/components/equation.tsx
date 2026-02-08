import { useEffect, useRef } from 'react'
import { ParseError, render } from 'katex'

const Equation = ({
  children,
  displayMode = true,
}: {
  children: string
  displayMode?: boolean
}) => {
  const containerRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    try {
      render(children, containerRef.current, { displayMode })
    } catch (e) {
      const message = e instanceof ParseError ? e.message : 'Invalid equation'
      containerRef.current.textContent = message
      if (process.env.NODE_ENV !== 'production') {
        console.error(e)
      }
    }
  }, [children, displayMode])

  return <span ref={containerRef} />
}

export default Equation
