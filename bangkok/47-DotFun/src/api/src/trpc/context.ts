import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify'
import { JwtPayload } from '@repo/schema'
import { jwtVerify } from '../utils/jwt'

export async function createContext({ req, res }: CreateFastifyContextOptions) {
  let user: JwtPayload | null = null

  const token = req.cookies.token
  if (token) {
    try {
      user = jwtVerify(token)
    } catch (error) {
      console.error(error)
    }
  }

  return { req, res, user }
}

export type Context = Awaited<ReturnType<typeof createContext>>

export async function createContextInner(token?: string) {
  const cookies: { [cookieName: string]: string | undefined } = { token }
  const opts = {
    req: { cookies },
    res: {
      setCookie: () => {},
    } as any,
  } as CreateFastifyContextOptions
  return createContext(opts)
}

export type InnerContext = Awaited<ReturnType<typeof createContextInner>>
