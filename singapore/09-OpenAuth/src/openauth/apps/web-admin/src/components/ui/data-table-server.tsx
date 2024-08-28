import { IconFilterSearch, IconLoader2 } from '@tabler/icons-react'
import type { ColumnDef, ColumnFiltersState, SortingState } from '@tanstack/react-table'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import * as React from 'react'

import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { Pagination } from './pagination'

interface Filter {
  key: string
  label?: string
  placeholder?: string
}

interface DataTableProps<TData, TValue> {
  columns: Array<ColumnDef<TData, TValue>>
  data: TData[]
  total: number
  pageIndex: number
  pageSize: number
  pagers?: number[]
  filters?: Filter[]
  pending?: boolean
  onPageChange: (pageIndex: number) => void
  onPageSizeChange: (pageSize: number) => void
  onSortingChange: (sorting: SortingState) => void
  onColumnFiltersChange: (filters: ColumnFiltersState) => void
}

const defualtPagers = [10, 25, 50, 100]
const defaultFilter: Filter[] = []

export function DataTableServer<TData, TValue>({
  columns,
  data,
  total,
  pageIndex,
  pageSize,
  pagers = defualtPagers,
  filters = defaultFilter,
  pending = false,
  onPageChange,
  onPageSizeChange,
  onSortingChange,
  onColumnFiltersChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(total / pageSize),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    onSortingChange: (newSorting) => {
      onPageChange(1)
      setSorting(newSorting)
      onSortingChange(newSorting as SortingState)
    },
    onColumnFiltersChange: (newFilters) => {
      onPageChange(1)
      setColumnFilters(newFilters)
      onColumnFiltersChange(newFilters as ColumnFiltersState)
    },
    state: {
      sorting,
      columnFilters,
      pagination: { pageIndex, pageSize },
    },
    getCoreRowModel: getCoreRowModel(),
  })

  const tableBody = useMemo(() => {
    if (pending) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-24 text-center">
            <IconLoader2 size={32} className="mx-auto animate-spin opacity-40" />
          </TableCell>
        </TableRow>
      )
    }

    if (table.getRowModel().rows.length > 0) {
      return table.getRowModel().rows.map(row => (
        <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
          {row.getVisibleCells().map(cell => (
            <TableCell key={cell.id} className="text-sm text-black/90">
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      ))
    }

    return (
      <TableRow>
        <TableCell colSpan={columns.length} className="h-24 text-center">
          No results.
        </TableCell>
      </TableRow>
    )
  }, [columns.length, pending, table])

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        {filters?.length > 0 && (
          <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <form>
              <div className="grid grid-cols-1 grid-cols-4 gap-2 lg:grid-cols-3 md:grid-cols-2">
                {filters.map(item => (
                  <div className="flex items-center gap-2" key={`table_filter_${item.key}`}>
                    {item.label && <span className="text-gray-500 font-medium">{item.label}</span>}
                    <div className="relative">
                      <IconFilterSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={item.placeholder ?? 'Search...'}
                        className="pl-8"
                        value={(table.getColumn(item.key)?.getFilterValue() as string) ?? ''}
                        onChange={(event) => {
                          event.preventDefault()
                          table.getColumn(item.key)?.setFilterValue(event.target.value)
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="relative border rounded-md">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id} className="text-base text-black/90 font-semibold">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {tableBody}
          </TableBody>
        </Table>
      </div>
      {table.getFilteredRowModel().rows.length > 0 && (
        <div className="flex justify-between">
          <div className="flex items-center gap-1 text-sm text-gray-400">
            Showing
            {' '}
            <span className="text-gray-600 font-semibold">{(pageIndex - 1) * pageSize + 1}</span>
            {' '}
            to
            {' '}
            <span className="text-gray-600 font-semibold">{Math.min(pageIndex * pageSize, total)}</span>
            {' '}
            of
            {' '}
            <span className="text-gray-600 font-semibold">{total}</span>
            records
          </div>
          <div className="flex items-center justify-end gap-6">
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                onPageChange(1)
                onPageSizeChange(Number(value))
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="" />
              </SelectTrigger>
              <SelectContent>
                {pagers.map(item => (
                  <SelectItem key={item} value={`${item}`}>
                    <span className="flex items-center justify-between gap-2">
                      {item}
                      <span className="text-gray-500">rows/page</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Pagination
              page={pageIndex}
              count={Math.ceil(total / pageSize)}
              onChange={(page) => {
                onPageChange(page)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
