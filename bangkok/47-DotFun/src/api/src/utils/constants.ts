export const REDIS_HOST = process.env.REDIS_HOST ?? '127.0.0.1'
export const REDIS_PORT = parseInt(process.env.REDIS_PORT ?? '6379')

export const JWT_SECRET = process.env.JWT_SECRET
export const IS_PRODUCTION = process.env.NODE_ENV === 'production'
