import { useOpenAuth } from '@open-auth/sdk-react'
import { SonicClient } from '@sonic-wallet/sdk-core'
import { useQuery } from '@tanstack/react-query'
import WebApp from '@twa-dev/sdk'
import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { useNavigate } from 'react-router-dom'

import { useSonicClient } from '@/store'
import { IS_TELEGRAM } from '@/utils/telegram'

export function useLeaderboard() {
  const { profile } = useOpenAuth()
  const { sonicClient } = useSonicClient()

  const query = useQuery({
    queryKey: ['getLeaderboard', profile?.id],
    queryFn: () => sonicClient.api.getLeaderboard(),
    enabled: sonicClient.api.isAuthorized(),
  })
  return query.data
}

export function useReferrals() {
  const { profile } = useOpenAuth()
  const { sonicClient } = useSonicClient()

  const query = useQuery({
    queryKey: ['getReferrals', profile?.id],
    queryFn: () => sonicClient.api.getReferrals(),
    enabled: !!profile && sonicClient.api.isAuthorized(),
  })
  return query.data
}

export function useTasks() {
  const { profile } = useOpenAuth()
  const { sonicClient } = useSonicClient()

  return useQuery({
    queryKey: ['getTasks', profile?.id],
    queryFn: () => sonicClient.api.getTasks(),
    enabled: sonicClient.api.isAuthorized(),
  })
}

export function useProfile() {
  const { profile, client } = useOpenAuth()
  const { sonicClient } = useSonicClient()

  const query1 = useQuery({
    queryKey: ['getProfile', profile?.id],
    queryFn: () => sonicClient.api.getProfile(),
    enabled: sonicClient.api.isAuthorized(),
  })

  const query2 = useQuery({
    queryKey: ['getOpenAuthWallets', profile?.id],
    queryFn: () => client.user.getWallets(),
    enabled: client.user.isAuthorized(),
  })

  return query1.data && query2.data && profile ? { ...query1.data, ...query2.data, openauth: profile } : null
}

export function useAutoLogIn() {
  const { client, logIn, config, profile, token } = useOpenAuth()
  const { setSonicClient } = useSonicClient()
  const nav = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    const client = new SonicClient('/')
    client.api.updateToken(token)
    setSonicClient(client)
  }, [setSonicClient, token])

  // redirect to log in if not logged in
  useEffect(() => {
    if (!IS_TELEGRAM && !profile && pathname !== '/login') {
      nav('/login')
    }
  }, [nav, pathname, profile])

  // redirect to home if logged in
  useEffect(() => {
    if (profile && pathname === '/login') {
      nav('/')
    }
  }, [nav, pathname, profile])

  // auto login telegram
  useEffect(() => {
    if (!IS_TELEGRAM || client.user.isAuthorized() || !WebApp.initData) {
      return
    }
    client.user
      .logInWithTelegram({ appId: config.appId, data: WebApp.initData })
      .then(({ token }) => logIn(token))
      .catch(console.error)
  }, [client.user, config.appId, logIn, setSonicClient])

  // telegram ready
  useEffect(() => {
    if (IS_TELEGRAM) {
      WebApp.ready()
    }
  }, [])
}
