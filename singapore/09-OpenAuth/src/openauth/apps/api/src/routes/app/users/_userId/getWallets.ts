import { Type } from '@fastify/type-provider-typebox'
import { TypeAuthHeaders, TypeUserWallets } from '@open-auth/sdk-core'
import type { FastifyInstance } from 'fastify'

import { getEthereumWallet } from '../../../../crypto/ethereum/getEthereumWallet'
import { getPolkadotWallet } from '../../../../crypto/polkadot/getPolkadotWallet'
import { getSolanaWallet } from '../../../../crypto/solana/getSolanaWallet'
import { verifyApp } from '../../../../handlers/verifyApp'
import type { AppAuthPayload } from '../../../../models/request'
import type { FastifyReplyTypebox, FastifyRequestTypebox } from '../../../../models/typebox'
import { prisma } from '../../../../utils/prisma'
import { ERROR404_SCHEMA } from '../../../../utils/schema'

const schema = {
  tags: ['App - Users'],
  summary: 'Get user wallets',
  params: Type.Object({
    userId: Type.String(),
  }),
  headers: TypeAuthHeaders,
  response: {
    200: Type.Object({
      data: TypeUserWallets,
    }),
    404: ERROR404_SCHEMA,
  },
}

async function handler(request: FastifyRequestTypebox<typeof schema>, reply: FastifyReplyTypebox<typeof schema>) {
  const { appId } = request.user as AppAuthPayload
  const { userId } = request.params
  const data = await prisma.user.findUnique({
    where: { appId, id: userId },
  })
  if (!data) {
    return reply.status(404).send({ message: 'User not found' })
  }
  const { walletAddress: solWallet } = getSolanaWallet(userId)
  const { walletAddress: ethWallet } = getEthereumWallet(userId)
  const { walletAddress: dotWallet } = getPolkadotWallet(userId)

  reply.status(200).send({
    data: {
      solWallet,
      ethWallet,
      dotWallet,
    },
  })
}

export default async function (fastify: FastifyInstance) {
  fastify.route({
    method: 'GET',
    url: '/wallets',
    onRequest: [verifyApp],
    schema,
    handler,
  })
}
