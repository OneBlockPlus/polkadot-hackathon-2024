import { prisma } from '../utils/prisma'

export async function getReferralChain(userId: string) {
  const referralChain = [userId]

  for (let i = 0; i < 10; i += 1) {
    const referral = await prisma.referral.findUnique({ where: { referee: referralChain.at(-1) } })
    if (referral) {
      if (referralChain.includes(referral.referrer)) {
        throw new Error(`Referral loop detected: ${userId}`)
      }
      referralChain.push(referral.referrer)
    } else {
      break
    }
  }

  return referralChain
}
