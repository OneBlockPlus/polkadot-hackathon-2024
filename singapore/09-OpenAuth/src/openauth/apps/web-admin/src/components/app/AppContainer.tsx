import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useParams } from 'react-router-dom'

import { AppTabs } from '@/components/app/AppTabs'
import { Loading } from '@/components/common/Loading'
import { useAdmin } from '@/context/admin'

interface Props {
  loading?: boolean
  children: ReactNode
}

export function AppContainer({ children, loading }: Props) {
  const { id = '' } = useParams()
  const { client } = useAdmin()
  const { data } = useQuery({
    queryKey: ['getApp', id],
    queryFn: () => client.admin.getApp(id),
    enabled: client.admin.isAuthorized(),
  })

  if (!data) {
    return null
  }

  return (
    <div className="">
      <div className="flex items-center gap-x-2 border-b px-20 pb-4 text-2xl font-semibold">
        {data.name}
      </div>
      <div className="mt-4 flex flex-row px-5 2xl:px-20 xl:px-10">
        <AppTabs />
        <div className="max-w-6xl flex-1 px-5 pb-20 pt-2 2xl:px-20 xl:px-10">
          {loading ? (
            <div className="flex-center p-8">
              <Loading />
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  )
}
