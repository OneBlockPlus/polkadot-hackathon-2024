import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'


interface Props {
  path: string
  name: string
  Icon: React.ComponentType<{ className?: string }>
}

export function SidebarNavLink({ path, name, Icon }: Props) {
  const pathname = usePathname()
  const isActive = pathname.indexOf(path) !== -1
  const dynamicClass = isActive
    ? 'bg-muted  text-primary hover:text-primar'
    : 'text-muted-foreground hover:text-primary'
  return (
    <Link
      href={path}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${dynamicClass}`}>
      <Icon className="h-4 w-4" />
      {name}
    </Link>
  )
}
