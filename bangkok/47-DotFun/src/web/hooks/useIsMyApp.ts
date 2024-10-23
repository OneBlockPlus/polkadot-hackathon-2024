import { trpc } from '@/utils/trpc'
import { useAuth } from './useAuth'
import { useMemo } from 'react'
import { skipToken } from '@tanstack/react-query'

export function useIsMyApp(appId?: string) {
  const { userId } = useAuth()
  const { data, isLoading } = trpc.app.getApp.useQuery(appId ? { id: appId } : skipToken, { enabled: !!appId })
  const isMyOwnApp = useMemo(() => userId === data?.user.id, [userId, data])

  return {
    isLoading,
    isMyOwnApp,
  }
}
