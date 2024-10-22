'use client'

import AppSandbox from '@/components/AppSandbox'
import ChatWindow from '@/components/ChatWindow'
import { trpc } from '@/utils/trpc'
import { useIsMyApp } from '@/hooks/useIsMyApp'
import { skipToken } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { toast } from 'sonner'

export default function AppCreation() {
  const router = useRouter()
  const { id } = router.query as { id?: string }
  const utils = trpc.useUtils()
  const { isLoading, isMyOwnApp } = useIsMyApp(id)
  const { data: commits } = trpc.app.getAppCommits.useQuery(id ? { appId: id } : skipToken, {
    enabled: !!id,
    select: (data) => data.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
  })

  const {
    mutate: commitApp,
    variables: pendingCommit,
    data: latestCommit,
    isPending,
  } = trpc.user.app.createCommit.useMutation({
    onSettled: async () => {
      await utils.app.getAppCommits.invalidate({ appId: id })
    },
  })

  const { data: isGeneratingCode } = trpc.app.getCommitById.useQuery(
    {
      id: Number(latestCommit?.commitId!),
    },
    {
      enabled: !!latestCommit,
      refetchInterval: (query) => {
        const latestCommit = query.state.data
        if (!latestCommit) {
          return 2000
        }
        if (!latestCommit.code) {
          return 2000
        }
        return false
      },
      select: (data) => latestCommit && !data.code,
    },
  )

  // navigate to home if not my app
  useEffect(() => {
    if (!isLoading && !isMyOwnApp && commits && commits.length > 0) {
      toast.error('You do not have access to edit this app')
      router.push('/').catch(console.error)
    }
  }, [commits, isLoading, isMyOwnApp, router])

  if (!id) {
    return null
  }

  return (
    <div className="flex h-full px-6 py-6 overflow-hidden flex-col-reverse lg:flex-row">
      <ChatWindow
        isGeneratingCode={!!isGeneratingCode}
        appId={id}
        onCommit={commitApp}
        isSending={isPending}
        commits={commits || []}
        pendingCommit={{
          prompt: pendingCommit?.prompt || '',
        }}
      />
      <AppSandbox
        appId={id}
        isCodeGenerating={isGeneratingCode}
        isEditMode
        onDebugApp={(prompt) => {
          commitApp({
            appId: id,
            prompt,
          })
        }}
      />
    </div>
  )
}
