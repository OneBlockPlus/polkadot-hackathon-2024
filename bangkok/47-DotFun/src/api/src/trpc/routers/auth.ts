import { z } from 'zod'
import { publicProcedure, router } from '../trpc'
import { getMessageText, verifyDOT } from '../../utils/crypto'
import { TRPCError } from '@trpc/server'
import { findOrCreateUser } from '../../repo/user'
import { JwtPayload, UserRole } from '@repo/schema'
import { jwtSign } from '../../utils/jwt'

export const authRouter = router({
  message: publicProcedure.query(() => {
    return {
      message: getMessageText(),
    }
  }),
  logOut: publicProcedure.mutation(async ({ ctx }) => {
    ctx.res.clearCookie('token')
    ctx.res.clearCookie('userId')
    return {}
  }),
  logInPolkadot: publicProcedure
    .input(
      z.object({
        wallet: z.string(),
        signature: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { wallet, signature } = input

      if (!verifyDOT(wallet, signature)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid signature',
        })
      }

      const user = await findOrCreateUser({ polkadotWallet: wallet })
      const payload: JwtPayload = { userId: user.id, userRole: UserRole.User }
      const token = jwtSign(payload)

      const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365)
      ctx.res.setCookie('token', token, { path: '/', expires, httpOnly: true })
      ctx.res.setCookie('userId', user.id, { path: '/', expires })

      return { token, userId: user.id }
    }),
})
