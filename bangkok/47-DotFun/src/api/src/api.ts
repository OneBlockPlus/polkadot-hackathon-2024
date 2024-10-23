import './utils/instrument'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import { fastifyTRPCPlugin, FastifyTRPCPluginOptions } from '@trpc/server/adapters/fastify'
import { createContext } from './trpc/context'
import { env } from './config/env'
import { config } from './config/config'
import { AppRouter, appRouter } from './trpc/router'
import sensible from '@fastify/sensible'
import cookie from '@fastify/cookie'
import fastify from 'fastify'
import { IS_PRODUCTION } from './utils/constants'

function createServer() {
  const server = fastify({ logger: config[env.NODE_ENV].logger, bodyLimit: 1024 * 1024 * 10 })

  server.register(helmet)
  server.register(cors)
  server.register(cookie, {
    parseOptions: {
      sameSite: 'none',
      secure: true,
    },
  })
  server.register(sensible)
  server.register(fastifyTRPCPlugin, {
    prefix: '/api',
    trpcOptions: {
      router: appRouter,
      createContext,
    } satisfies FastifyTRPCPluginOptions<AppRouter>['trpcOptions'],
  })

  const stop = async () => {
    await server.close()
  }
  const start = async () => {
    try {
      await server.listen({
        host: IS_PRODUCTION ? '0.0.0.0' : undefined,
        port: 5000,
      })
    } catch (err) {
      server.log.error(err)
    }
  }

  return { server, start, stop }
}

const server = createServer()
void server.start()
