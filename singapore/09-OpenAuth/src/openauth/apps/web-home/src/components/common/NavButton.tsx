import { useLocation, useNavigate } from 'react-router-dom'

import { cn } from '@/utils/css'

export function NavButton({
  children,
  onClick,
  className,
  to,
}: {
  children: any
  onClick?: any
  className?: string
  to?: string
}) {
  const nav = useNavigate()
  const { pathname } = useLocation()

  const onClickNav = useCallback(() => {
    if (onClick) {
      return onClick()
    }
    if (to) {
      if (to.startsWith('http')) {
        window.open(to, '_blank')
      } else {
        nav(to)
      }
    }
  }, [nav, onClick, to])

  return (
    <div
      className={cn(
        'px-4 py-3 text-base font-400 flex items-center gap-1 cursor-pointer transition-colors hover:text-foreground',
        pathname === to ? 'text-foreground' : 'text-muted-foreground',
        className,
      )}
      onClick={onClickNav}
    >
      {children}
    </div>
  )
}
