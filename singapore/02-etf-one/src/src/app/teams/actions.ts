'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth/auth'
import { jsonArrayFrom } from 'kysely/helpers/postgres'
import { v4 } from 'uuid'
import { TeamId } from '@/generated/public/Team'
import { TeamMemberId } from '@/generated/public/TeamMember'
import { WalletId } from '@/generated/public/Wallet'
import { UsersId } from '@/generated/public/Users'
import { TeamWalletId } from '@/generated/public/TeamWallet'
import { revalidatePath } from 'next/cache'


export type WalletSelection = {
  value: WalletId
  label: string | null
  address: string
}

export async function getWalletSelection() {
  const session = await auth()
  if (!session?.user.sub) {
    return []
  }

  const wallets = await db
    .selectFrom('wallet')
    .where('user_id', '=', session?.user.sub)
    .selectAll()
    .execute()
  return wallets.map((wallet) => ({
    value: wallet.id,
    label: wallet.name,
    address: wallet.address,
  }))
}

export async function getTeams() {
  const session = await auth()
  if (!session?.user.sub) {
    return []
  }
  return await db
    .selectFrom('team')
    .select((team) => [
      'id',
      'name',
      'owner_user_id',
      'created_at',
      jsonArrayFrom(
        team
          .selectFrom('team_member as tm')
          .select([
            'tm.id',
            'tm.team_id',
            'tm.user_id',
            'tm.name',
            'tm.role',
            'tm.address',
            'tm.created_at',
          ])
          .whereRef('tm.team_id', '=', 'team.id'),
      ).as('members'),
      jsonArrayFrom(
        team
          .selectFrom('wallet as w')
          .select([
            'w.id',
            'w.user_id',
            'w.name',
            'w.address',
            'w.type',
            'w.balance',
            'w.created_at',
          ])
          .rightJoin('team_wallet as tw', 'tw.wallet_id', 'w.id')
          .whereRef('tw.team_id', '=', 'team.id'),
      ).as('wallets'),
    ])
    .where('owner_user_id', '=', session?.user.sub)
    // .compile()
    .execute()
}

export async function createTeam(
  name: string,
  members: string[],
  selectedWallets: string[],
) {
  const session = await auth()
  const owner_user_id = session!.user.sub!
  const newTeam = await db
    .insertInto('team')
    .values({
      id: <TeamId>v4(),
      name,
      owner_user_id: owner_user_id,
    })
    .returningAll()
    .executeTakeFirst()

  const memberValues = members.map((member) => ({
    id: <TeamMemberId>v4(),
    team_id: newTeam!.id,
    user_id: <UsersId>v4(),
    role: 'member',
    name: 'User1',
    address: member,
    created_at: new Date(),
  }))
  if (memberValues.length > 0) {
    await db.insertInto('team_member').values(memberValues).execute()
  }

  const wallets = selectedWallets.map((wallet) => ({
    id: <TeamWalletId>v4(),
    team_id: newTeam!.id,
    wallet_id: wallet,
    created_at: new Date(),
  }))

  await db.insertInto('team_wallet').values(wallets).execute()
  revalidatePath('/teams')
}
