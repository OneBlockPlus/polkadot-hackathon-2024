import type { User } from '@prisma/client'
import bcrypt from 'bcrypt'

import { SALT_ROUNDS } from '../utils/auth'
import { generateReferCode } from '../utils/common'
import { prisma } from '../utils/prisma'

interface Params {
  appId: string
  google?: string
  discord?: string
  tiktok?: string
  github?: string
  huggingface?: string
  email?: string
  telegram?: string
  ethAddress?: string
  solAddress?: string
}

interface Options {
  displayName?: string
}

export async function findOrCreateUser(params: Params, options?: Options): Promise<User> {
  if (Object.values(params).filter(i => !!i).length !== 2) {
    throw new Error('Missing required fields')
  }

  const user = await prisma.user.findFirst({ where: params })

  if (user) {
    return prisma.user.update({
      where: { id: user.id },
      data: {
        displayName: user.displayName ?? options?.displayName,
        lastSeenAt: new Date(),
      },
    })
  }

  return prisma.user.create({
    data: {
      ...params,
      referCode: generateReferCode(),
    },
  })
}

export async function createUserByUsername({ appId, username, password }: { appId: string, username: string, password: string }) {
  return prisma.user.create({
    data: {
      appId,
      username,
      password: await bcrypt.hash(password, SALT_ROUNDS),
      displayName: username,
      referCode: generateReferCode(),
    },
  })
}
