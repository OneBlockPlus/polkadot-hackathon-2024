import Redis from 'ioredis'
import { REDIS_HOST, REDIS_PORT } from '../../utils/constants'

export const redis = new Redis({ host: REDIS_HOST, port: REDIS_PORT, keyPrefix: 'dotfun:' })

export enum RedisKeys {
  AppUserId = 'apps:appid-userid',
}

export class RedisTool {
  // app id to user id
  static async setAppUserId(appId: string, userId: string) {
    await redis.hset(RedisKeys.AppUserId, appId, userId)
  }

  static async getAppUserId(appId: string) {
    return redis.hget(RedisKeys.AppUserId, appId)
  }
}
