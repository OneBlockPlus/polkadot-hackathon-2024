import type { User as UserResponse } from '@open-auth/sdk-core'
import type { User } from '@prisma/client'

export function transformUserToReponse(user: User): UserResponse {
  return {
    ...user,
    createdAt: user.createdAt.getTime(),
    lastSeenAt: user.lastSeenAt.getTime(),
  }
}
