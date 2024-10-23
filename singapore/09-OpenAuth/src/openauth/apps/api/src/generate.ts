import path from 'node:path'

import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import Fastify from 'fastify'

import { clientGeneratorPlugin } from './plugins/generator'
import { prisma } from './utils/prisma'
import { avatarQueue } from './utils/queue'
import { redis } from './utils/redis'

const server = Fastify({ logger: true }).withTypeProvider<TypeBoxTypeProvider>()

async function start() {
  server.register(clientGeneratorPlugin)
  server.register(require('@fastify/autoload'), {
    dir: path.join(__dirname, 'routes'),
    routeParams: true,
  })

  await server.ready()
}

start()
  .then(async () => {
    await prisma.$disconnect()
    await avatarQueue.close()
    redis.disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
