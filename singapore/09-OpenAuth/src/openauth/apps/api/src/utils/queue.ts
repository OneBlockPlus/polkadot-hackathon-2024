import type { QueueOptions } from 'bull'
import Queue from 'bull'

import { REDIS_HOST, REDIS_PORT } from '../constants'

const queueOptions: QueueOptions = {
  redis: { port: REDIS_PORT, host: REDIS_HOST },
  prefix: 'openauth:bull',
}

export interface AvatarQueuePayload {
  userId: string
  imageURL?: string
  skipIfExist?: boolean
}

export const avatarQueue = new Queue<AvatarQueuePayload>('avatar', queueOptions)
