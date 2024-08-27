import { ChevronLeftIcon, ChevronRightIcon, DotsHorizontalIcon } from '@radix-ui/react-icons'
import * as React from 'react'

import type { ButtonProps } from '@/components/ui/button'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/css'

import type { PaginationProps } from './use-pagination'
import usePagination from './use-pagination'

function PaginationRoot({ className, ...props }: React.ComponentProps<'nav'>) {
  return <nav role="navigation" aria-label="pagination" className={cn('flex', className)} {...props} />
}

PaginationRoot.displayName = 'PaginationRoot'

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn('flex flex-row items-center gap-1', className)} {...props} />
  ),
)
PaginationContent.displayName = 'PaginationContent'

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('', className)} {...props} />
))
PaginationItem.displayName = 'PaginationItem'

type PaginationLinkProps = {
  isActive?: boolean
} & ButtonProps

function PaginationLink({ className, isActive, size = 'icon', ...props }: PaginationLinkProps) {
  return (
    <Button
      aria-current={isActive ? 'page' : undefined}
      variant={isActive ? 'default' : 'secondary'}
      size={size}
      className={cn(className, isActive ? 'text-white' : '', '!disabled:cursor-not-allowed')}
      {...props}
    />
  )
}

PaginationLink.displayName = 'PaginationLink'

function PaginationPrevious({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink aria-label="Go to previous page" size="default" className={cn('px-2.5', className)} {...props}>
      <ChevronLeftIcon className="h-4 w-4" />
    </PaginationLink>
  )
}

PaginationPrevious.displayName = 'PaginationPrevious'

function PaginationNext({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink aria-label="Go to next page" size="default" className={cn('px-2.5', className)} {...props}>
      <ChevronRightIcon className="h-4 w-4" />
    </PaginationLink>
  )
}

PaginationNext.displayName = 'PaginationNext'

function PaginationEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span aria-hidden className={cn('flex h-9 w-9 items-center justify-center', className)} {...props}>
      <DotsHorizontalIcon className="h-4 w-4 text-white" />
      <span className="sr-only">More pages</span>
    </span>
  )
}

PaginationEllipsis.displayName = 'PaginationEllipsis'

const Pagination: React.FC<PaginationProps> = (props) => {
  const { items } = usePagination(props)
  const { className } = props
  return (
    <PaginationRoot className={className}>
      <PaginationContent>
        {items.map(({ page, type, selected, ...item }) => {
          let children = null

          switch (type) {
            case 'start-ellipsis':
            case 'end-ellipsis': {
              children = <PaginationEllipsis />

              break
            }
            case 'page': {
              children = (
                <PaginationLink isActive={selected} {...item}>
                  {page}
                </PaginationLink>
              )

              break
            }
            case 'previous': {
              children = <PaginationPrevious {...item} />

              break
            }
            case 'next': {
              children = <PaginationNext {...item} />

              break
            }
            default: {
              children = (
                <button type="button" {...item}>
                  {type}
                </button>
              )
            }
          }

          return <PaginationItem key={`pagination-item-${page}`}>{children}</PaginationItem>
        })}
      </PaginationContent>
    </PaginationRoot>
  )
}
Pagination.displayName = 'Pagination'

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationRoot,
}
