import type { App } from '@prisma/client'

import { prisma } from '../utils/prisma'
import { redis } from '../utils/redis'

const appKeyPrefix = 'app:'

export async function updateAppCache(app: App) {
  const key = appKeyPrefix + app.id
  redis.set(key, JSON.stringify(app))
}

export async function getAppFromCache(id: string): Promise<App | null> {
  const key = appKeyPrefix + id
  const app = await redis.get(key)
  return app ? JSON.parse(app) as App : null
}

export async function updateAppsCache() {
  const apps = await prisma.app.findMany()
  for (const app of apps) {
    await updateAppCache(app)
  }
}
