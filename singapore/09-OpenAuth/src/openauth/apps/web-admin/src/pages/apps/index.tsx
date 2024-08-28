import { useQuery } from '@tanstack/react-query'
import { NavLink, useNavigate } from 'react-router-dom'

import { useAdmin } from '@/context/admin'

export default function () {
  const nav = useNavigate()
  const { client } = useAdmin()
  const { data } = useQuery({
    queryKey: ['getApps'],
    queryFn: () => client.admin.listApps(),
    gcTime: 0,
  })

  if (!data) {
    return null
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex-center justify-between">
        <div>Apps</div>
        <Button onClick={() => nav('/apps/new')}>New App</Button>
      </div>
      <div className="grid grid-cols-4 gap-2 py-6">
        {data.map((i: any) => (
          <NavLink to={`/apps/${i.id}`} key={i.id}>
            <Card className="p-6" key={i.id}>
              <div className="text-lg font-semibold">{i.name}</div>
              <div className="text-xs opacity-50">{i.id}</div>
            </Card>
          </NavLink>
        ))}
      </div>
    </div>
  )
}
