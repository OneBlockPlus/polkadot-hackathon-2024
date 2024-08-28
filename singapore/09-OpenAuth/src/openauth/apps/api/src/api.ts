import './utils/instrument'

import path from 'node:path'

import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { setupFastifyErrorHandler } from '@sentry/node'
import Fastify from 'fastify'
import qs from 'qs'

import { JWT_PRIVATE_KEY, JWT_PUBLIC_KEY } from './constants'
import { init } from './utils/init'
import { prisma } from './utils/prisma'

init()

const server = Fastify({
  logger: true,
  querystringParser: str => qs.parse(str),
}).withTypeProvider<TypeBoxTypeProvider>()

setupFastifyErrorHandler(server)

server.setErrorHandler((error, request, reply) => {
  console.error(error)
  const { name, message } = error
  let fullMessage = ''
  if (name.length > 0) {
    fullMessage = message.length > 0 ? `${name}: ${message}` : name
  } else {
    fullMessage = message.length > 0 ? message : 'Unknown Error'
  }
  return reply.status(error.statusCode ?? 500).send({ message: fullMessage })
})

async function start() {
  await server.register(cors, {})
  await server.register(require('fastify-metrics'), {
    endpoint: '/metrics',
    routeMetrics: {
      enabled: true,
      routeBlacklist: ['/metrics', '/docs'],
    },
  })
  await server.register(require('@fastify/swagger'))
  await server.register(require('@fastify/swagger-ui'), {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  })

  server.register(jwt, {
    secret: {
      private: JWT_PRIVATE_KEY,
      public: JWT_PUBLIC_KEY,
    },
    sign: { algorithm: 'EdDSA' },
  })
  server.register(cookie, {
    secret: 'openauth-cookie-secret',
    hook: 'onRequest',
    parseOptions: {},
  })
  server.register(require('@fastify/autoload'), {
    dir: path.join(__dirname, 'routes'),
    routeParams: true,
  })

  await server.ready()
  await server.listen({ port: 5566, host: '0.0.0.0' })
}

start()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })

// graceful shutdown
const listeners = ['SIGINT', 'SIGTERM']
listeners.forEach((signal) => {
  process.on(signal, async () => {
    await server.close()
    process.exit(0)
  })
})
