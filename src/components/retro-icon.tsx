import type { ComponentType } from 'react'

type IconProps = {
  className?: string
  size?: number
  title?: string
}

const iconModule = require('@react95/icons') as Record<
  string,
  ComponentType<IconProps>
>

const fallbackIcon = (props: IconProps) => (
  <span
    className={props.className}
    style={{
      display: 'inline-block',
      width: props.size || 16,
      height: props.size || 16,
    }}
    aria-hidden={props.title ? undefined : 'true'}
    title={props.title}
  />
)

const iconCandidates: Record<string, string[]> = {
  home: ['Computer', 'WindowsExplorer', 'Desktop', 'ProgramManager'],
  blog: ['Notepad', 'TextFile', 'Write', 'FileText'],
  contact: ['Mail', 'Envelope', 'Phone', 'User', 'Users'],
  source: ['Folder', 'Explorer', 'Network', 'HardDisk'],
  lightning: ['Lightning', 'Power', 'Flash'],
  jamstack: ['Globe', 'Network', 'World'],
  wifi: ['Network', 'NetworkFolder', 'Wireless', 'Wifi'],
  edit: ['Write', 'Paint', 'Notepad'],
  plus: ['Plus', 'Add', 'New'],
  scroll: ['Help', 'Info', 'Note'],
  info: ['Info', 'Help', 'Warning', 'Question'],
  notion: ['Document', 'Notepad', 'TextFile'],
  lighthouse: ['Search', 'Magnifier', 'View'],
  twitter: ['Network', 'Phone', 'Mail'],
  github: ['Folder', 'HardDisk', 'ProgramManager'],
  linkedin: ['Users', 'Network', 'User'],
}

const pickIcon = (name: string): ComponentType<IconProps> | null => {
  const candidates = iconCandidates[name] || [name]
  for (const candidate of candidates) {
    if (iconModule[candidate]) return iconModule[candidate]
  }
  return null
}

const RetroIcon = ({
  name,
  size = 16,
  className,
  title,
}: {
  name: string
  size?: number
  className?: string
  title?: string
}) => {
  const IconComp: ComponentType<IconProps> = pickIcon(name) || fallbackIcon
  const isFallback = IconComp === fallbackIcon
  const mergedClassName = isFallback
    ? [className, 'retro-icon-fallback'].filter(Boolean).join(' ')
    : className
  return <IconComp className={mergedClassName} size={size} title={title} />
}

export default RetroIcon
