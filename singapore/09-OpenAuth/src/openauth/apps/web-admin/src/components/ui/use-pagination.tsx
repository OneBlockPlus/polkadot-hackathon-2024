import { useEffect, useState } from 'react'

export interface PaginationProps {
  boundaryCount?: number
  componentName?: string
  count?: number
  defaultPage?: number
  disabled?: boolean
  hideNextButton?: boolean
  hidePrevButton?: boolean
  onChange?: (value: number) => void
  page?: number
  showFirstButton?: boolean
  showLastButton?: boolean
  siblingCount?: number
  [key: string]: any
}

interface PaginationItem {
  'onClick': () => void
  'type': string | 'page'
  'page': number
  'selected': boolean
  'disabled': boolean
  'aria-current'?: 'true' | undefined
}

export default function usePagination(props: PaginationProps = {}) {
  const {
    boundaryCount = 1,
    count = 1,
    defaultPage = 1,
    disabled = false,
    hideNextButton = false,
    hidePrevButton = false,
    onChange: handleChange,
    page: pageProp,
    showFirstButton = false,
    showLastButton = false,
    siblingCount = 1,
    ...other
  } = props

  const [page, setPageState] = useState<number>(pageProp || defaultPage)

  useEffect(() => {
    if (pageProp !== undefined) {
      setPageState(pageProp)
    }
  }, [pageProp])

  const handleClick = (value: number) => {
    if (pageProp === undefined) {
      setPageState(value)
    }
    if (handleChange) {
      handleChange(value)
    }
  }

  const range = (start: number, end: number) => {
    const length = end - start + 1
    return Array.from({ length }, (_, i) => start + i)
  }

  const startPages = range(1, Math.min(boundaryCount, count))
  const endPages = range(Math.max(count - boundaryCount + 1, boundaryCount + 1), count)

  const siblingsStart = Math.max(
    Math.min(
      // Natural start
      page - siblingCount,
      // Lower boundary when page is high
      count - boundaryCount - siblingCount * 2 - 1,
    ),
    // Greater than startPages
    boundaryCount + 2,
  )

  const siblingsEnd = Math.min(
    Math.max(
      // Natural end
      page + siblingCount,
      // Upper boundary when page is low
      boundaryCount + siblingCount * 2 + 2,
    ),
    // Less than endPages
    endPages.length > 0 ? endPages[0] - 2 : count - 1,
  )

  const itemList: Array<number | string> = [
    ...(showFirstButton ? ['first'] : []),
    ...(hidePrevButton ? [] : ['previous']),
    ...startPages,
    ...(siblingsStart > boundaryCount + 2
      ? ['start-ellipsis']
      : boundaryCount + 1 < count - boundaryCount
        ? [boundaryCount + 1]
        : []),
    ...range(siblingsStart, siblingsEnd),
    ...(siblingsEnd < count - boundaryCount - 1
      ? ['end-ellipsis']
      : count - boundaryCount > boundaryCount
        ? [count - boundaryCount]
        : []),
    ...endPages,
    ...(hideNextButton ? [] : ['next']),
    ...(showLastButton ? ['last'] : []),
  ]

  const buttonPage = (type: string): number | null => {
    switch (type) {
      case 'first': {
        return 1
      }
      case 'previous': {
        return page - 1
      }
      case 'next': {
        return page + 1
      }
      case 'last': {
        return count
      }
      default: {
        return null
      }
    }
  }

  const items: PaginationItem[] = itemList.map(item => typeof item === 'number'
    ? {
        'onClick': () => {
          handleClick(item)
        },
        'type': 'page',
        'page': item,
        'selected': item === page,
        disabled,
        'aria-current': item === page ? 'true' : undefined,
      }
    : {
        onClick: () => {
          if (typeof buttonPage(item) === 'number') {
            handleClick(buttonPage(item) as number)
          }
        },
        type: item,
        page: buttonPage(item) || 0,
        selected: false,
        disabled:
            disabled
            || (!item.includes('ellipsis') && (item === 'next' || item === 'last' ? page >= count : page <= 1)),
      })

  return {
    items,
    ...other,
  }
}
