import type { ReactNode } from 'react'

interface Props {
  title: string
  subtitle?: string
  button?: ReactNode
}

export function AppHeader({ title, subtitle, button }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex-center justify-between">
        <div className="text-xl font-bold">{title}</div>
        {button}
      </div>
      {subtitle && <div className="opacity-60">{subtitle}</div>}
    </div>
  )
}
