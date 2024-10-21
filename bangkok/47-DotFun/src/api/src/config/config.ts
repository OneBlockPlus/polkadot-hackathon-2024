import { FastifyServerOptions } from 'fastify'

interface IConfig {
  logger: FastifyServerOptions['logger']
}

// Define configs here based on NODE_ENV = "development" | "testing" | "production"
export const config: Record<string, IConfig> = {
  development: {
    logger: {
      level: 'debug',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'yyyy-mm-dd HH:MM:ss.l',
        },
      },
    },
  },
  production: {
    logger: {
      level: 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'yyyy-mm-dd HH:MM:ss.l',
        },
      },
      serializers: {
        req(req) {
          return {
            method: req.method,
            url: req.url,
          }
        },
      },
    },
  },
  testing: { logger: false },
}
