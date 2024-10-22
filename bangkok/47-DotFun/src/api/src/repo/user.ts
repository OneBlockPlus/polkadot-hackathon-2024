import { User } from '@prisma/client'
import { prisma } from '../utils/prisma'

export async function findOrCreateUser(params: { polkadotWallet: string }): Promise<User> {
  const user = await prisma.user.findFirst({ where: params })

  if (user) {
    return prisma.user.update({
      where: { id: user.id },
      data: {},
    })
  }

  return prisma.user.create({
    data: {
      ...params,
      username: shortenPolkadotWallet(params.polkadotWallet),
    },
  })
}

export function getUserDisplayName({ username, polkadotWallet }: User) {
  if (username) {
    return username
  }
  if (polkadotWallet) {
    return shortenPolkadotWallet(polkadotWallet)
  }
  return null
}

function shortenPolkadotWallet(polkadotWallet: string) {
  return `${polkadotWallet.slice(0, 6)}...${polkadotWallet.slice(-4)}`
}
