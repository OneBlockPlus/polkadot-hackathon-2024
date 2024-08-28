import type { User } from '@open-auth/sdk-core'
import { CaretSortIcon } from '@radix-ui/react-icons'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef, ColumnFiltersState, SortingState } from '@tanstack/react-table'
import dayjs from 'dayjs'
import { useParams } from 'react-router-dom'

import { AppContainer } from '@/components/app/AppContainer'
import { AppHeader } from '@/components/app/AppHeader'
import { UserAccountIcons } from '@/components/user/UserAccountIcons'
import { UserDetailDialog } from '@/components/user/UserDetailDialog'
import { useAdmin } from '@/context/admin'

export default function () {
  const { id: appId = '' } = useParams()
  const [selectedUser, setSelectedUser] = useState<any>()
  const [page, setPage] = useState<number>(1)
  const [limit, setLimit] = useState<number>(10)
  const [sorting, setSorting] = useState<SortingState>([])
  const [filtersValue, setFiltersValue] = useState<ColumnFiltersState>([])
  const { client } = useAdmin()

  const filtersConfig = [
    {
      key: 'id',
      placeholder: 'Search',
    },
  ]

  const columns: Array<ColumnDef<User>> = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <div>{row.getValue('id')}</div>,
    },
    {
      accessorKey: 'accounts',
      header: 'Linked Accounts',
      cell: ({ row }) => (
        <div className="w-30">
          <UserAccountIcons user={row.original} />
        </div>
      ),
    },
    {
      accessorKey: 'referCode',
      header: 'Refer Code',
      cell: ({ row }) => <div className="w-20">{row.getValue('referCode')}</div>,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <span
          className="inline-flex cursor-pointer items-center gap-1 break-keep px-1 hover:text-accent-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Registered At
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </span>
      ),
      cell: ({ row }) => (
        <div className="w-35">
          {row.getValue('createdAt') ? dayjs(row.getValue('createdAt')).format('YYYY-MM-DD HH:mm') : '-'}
        </div>
      ),
    },
    {
      accessorKey: 'lastSeenAt',
      header: ({ column }) => (
        <span
          className="inline-flex cursor-pointer items-center gap-1 break-keep px-1 hover:text-accent-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Last Seen
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </span>
      ),
      cell: ({ row }) => (
        <div className="w-35">
          {row.getValue('lastSeenAt') ? dayjs(row.getValue('lastSeenAt')).format('YYYY-MM-DD HH:mm') : '-'}
        </div>
      ),
    },
    {
      accessorKey: 'operate',
      header: 'Operate',
      cell: ({ row }) => (
        <Button variant="secondary" size="sm" onClick={() => setSelectedUser(row.original)}>
          Detail
        </Button>
      ),
    },
  ]

  const { data, isFetching } = useQuery({
    queryKey: ['getUsers', appId, page, limit, filtersValue, sorting],
    gcTime: 0,
    queryFn: async () => {
      const { appSecret } = await client.admin.getAppSecret(appId)
      client.app.updateToken(appSecret)

      const queryParams: {
        page: number
        limit: number
        search?: string
        sortBy?: string
        order?: 'asc' | 'desc'
      } = {
        page,
        limit,
      }

      if (sorting?.[0]) {
        queryParams.sortBy = sorting[0].id
        queryParams.order = sorting[0].desc ? 'desc' : 'asc'
      }
      if (filtersValue.length > 0) {
        queryParams.search = filtersValue[0].value as string
      }
      return client.app.listUsers(queryParams)
    },
  })

  return (
    <AppContainer>
      <AppHeader title="Users" />

      <div className="grid grid-cols-3 mt-5 gap-5">
        <Card>
          <CardContent className="px-4 py-3">
            <div className="">Active users</div>
            <div className="text-lg font-bold">{data?.meta.totalItems || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-3">
            <div className="">New users</div>
            <div className="text-lg font-bold">{data?.meta.totalItems || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-3">
            <div className="">Total users</div>
            <div className="text-lg font-bold">{data?.meta.totalItems || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>All users</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTableServer
            filters={filtersConfig}
            columns={columns}
            data={data?.data ?? []}
            total={data?.meta.totalItems ?? 0}
            pageIndex={page}
            pageSize={limit}
            pending={isFetching}
            onPageChange={setPage}
            onPageSizeChange={setLimit}
            onSortingChange={setSorting}
            onColumnFiltersChange={setFiltersValue}
          />
        </CardContent>
      </Card>
      <UserDetailDialog user={selectedUser} onClose={() => setSelectedUser(undefined)} />
    </AppContainer>
  )
}
