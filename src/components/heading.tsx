import type { ReactElement, ReactNode } from 'react'

const collectText = (el: ReactNode, acc: string[] = []) => {
  if (el) {
    if (typeof el === 'string') acc.push(el)
    if (Array.isArray(el)) el.map((item) => collectText(item, acc))
    if (typeof el === 'object') {
      const element = el as ReactElement<{ children?: ReactNode }>
      collectText(element.props?.children, acc)
    }
  }
  return acc.join('').trim()
}

const Heading = ({
  children: component,
  id,
}: {
  children?: ReactNode
  id?: string
}) => {
  const element = component as ReactElement<{ children?: ReactNode }>
  const children = element?.props?.children || ''
  const text = children

  const derivedId =
    id ??
    collectText(text).toLowerCase().replace(/\s/g, '-').replace(/[?!:]/g, '')

  return (
    <a href={`#${derivedId}`} id={derivedId} style={{ color: 'inherit' }}>
      {component}
    </a>
  )
}

export default Heading
