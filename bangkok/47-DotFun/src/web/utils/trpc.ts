import * as Sentry from '@sentry/nextjs'

import { httpLink } from '@trpc/client'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import { createTRPCNext } from '@trpc/next'
import superjson from 'superjson'
import type { AppRouter } from 'api/src/types'
import type { FastifyCookieOptions } from '@fastify/cookie'
import { MutationCache, QueryCache } from '@tanstack/react-query'
import { toast } from 'sonner'
import { TRPCError } from './types'

export const trpc = createTRPCNext<AppRouter>({
  config: ({ ctx }) => ({
    queryClientConfig: {
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
      queryCache: new QueryCache({
        onError: (error) => {
          const trpcError = error as TRPCError
          toast(trpcError.message)
          Sentry.captureException(error)
        },
      }),
      mutationCache: new MutationCache({
        onError: (error) => {
          const trpcError = error as TRPCError
          toast(trpcError.message)
          Sentry.captureException(error)
        },
      }),
    },
    links: [
      httpLink({
        transformer: superjson,
        url: `/api`,
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: 'include',
          })
        },
      }),
    ],
  }),
  ssr: false,
  transformer: superjson,
})

export type RouterInputs = inferRouterInputs<AppRouter>
export type RouterOutputs = inferRouterOutputs<AppRouter>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const options: FastifyCookieOptions | undefined = undefined
