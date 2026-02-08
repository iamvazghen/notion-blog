import { useEffect, useRef } from 'react'

const TweetEmbed = ({ html }: { html: string }) => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.innerHTML = html || ''
  }, [html])

  return <div ref={containerRef} />
}

export default TweetEmbed
