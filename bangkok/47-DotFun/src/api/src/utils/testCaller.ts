import { testRouter } from '../trpc/router'
import { createContextInner } from '../trpc/context'

export const createTestCaller = async (token?: string) => {
  const ctx = await createContextInner(token)
  return testRouter.createCaller(ctx)
}
