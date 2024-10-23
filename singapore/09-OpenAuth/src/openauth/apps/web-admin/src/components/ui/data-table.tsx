import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
} from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import * as React from 'react'

import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { Pagination } from './pagination'

interface DataTableProps<TData, TValue> {
  columns: Array<ColumnDef<TData, TValue>>
  data: TData[]
  searchKey?: string
  loading?: boolean
}

export function DataTable<TData, TValue>({ columns, data, searchKey, loading = false }: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })
  const pagers = [10, 25, 50, 100]

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        {searchKey && (
          <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <form>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />

                <Input
                  placeholder="Search"
                  className="pl-8"
                  value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
                  onChange={event => table.getColumn(searchKey)?.setFilterValue(event.target.value)}
                />
              </div>
            </form>
          </div>
        )}
      </div>
      <div className="border rounded-md">
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="text-sm text-black/90">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {loading ? 'loading...' : 'No results.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {table.getFilteredRowModel().rows.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex gap-1 text-sm text-gray-400">
            Showing
            <span className="text-gray-600 font-semibold">
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
            </span>
            {' '}
            to
            {' '}
            <span className="text-gray-600 font-semibold">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length,
              )}
              {' '}
            </span>
            of
            {' '}
            <span className="text-gray-600 font-semibold">
              {table.getFilteredRowModel().rows.length}
              {' '}
            </span>
            records
          </div>
          <div className="flex items-center justify-end gap-6">
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
                table.setPageIndex(0)
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
              page={table.getState().pagination.pageIndex + 1}
              count={table.getPageCount()}
              onChange={(page) => {
                table.setPageIndex(page - 1)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
