import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useAdmin } from '@/context/admin'

export function useSetupChecker() {
  const nav = useNavigate()
  const { pathname } = useLocation()
  const { data } = useQueryAdminConfig()

  useEffect(() => {
    if (data && pathname !== '/setup' && !data.initialized) {
      nav('/setup')
    }
  }, [nav, pathname, data])
}

export function useQueryAdminConfig() {
  const { client } = useAdmin()

  return useQuery<{ initialized: boolean }>({
    queryKey: ['getAdminConfig'],
    queryFn: () => client.admin.getConfig(),
  })
}
