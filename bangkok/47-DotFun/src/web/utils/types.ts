import { TRPCClientError } from '@trpc/client'
import { RouterOutputs } from './trpc'
import { AppRouter } from 'api/src/types'

export type UserProfile = RouterOutputs['user']['profile']['getProfile']
export type Commit = RouterOutputs['app']['getAppCommits'][0]
export type TRPCError = TRPCClientError<AppRouter>
export type Profile = RouterOutputs['user']['profile']['getProfile']
