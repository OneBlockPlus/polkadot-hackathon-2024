import dotenv from 'dotenv'

dotenv.config()

export const IS_PRODUCTION = process.env.NODE_ENV === 'production'
export const REDIS_HOST = IS_PRODUCTION ? 'openauth-redis' : '127.0.0.1'
export const REDIS_PORT = 6379
export const WALLET_SEED_SALT = process.env.WALLET_SEED_SALT ?? ''
export const SENTRY_DSN = process.env.SENTRY_DSN ?? ''

console.info(`IS_PRODUCTION: ${IS_PRODUCTION}`)
