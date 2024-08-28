import { Team } from '@/generated/public/Team'
import { TeamMember } from '@/generated/public/TeamMember'
import { Wallet } from '@/generated/public/Wallet'


export type TeamWithMembersAndWallets = Team & {
  members: TeamMember[]
  wallets: Wallet[]
}