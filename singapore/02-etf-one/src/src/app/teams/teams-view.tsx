import { getTeams } from '@/app/teams/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { AllowedWallets } from '@/app/teams/allowed-wallets'
import TeamMembers from '@/app/teams/team-members'


export async function TeamsView() {
  const teams = await getTeams()

  return (
    <>
      {teams.map((team) => (
        <Card className="relative" key={team.id}>
          <CardHeader className="">
            <CardTitle>
              <div className="flex items-center gap-4">
                <Avatar className="h-9 w-9 rounded-full sm:flex">
                  {/*<Jazzicon*/}
                  {/*  diameter={100}*/}
                  {/*  seed={Math.round(Math.random() * 10000000)}*/}
                  {/*/>*/}
                </Avatar>
                <div className="flex gap-2">
                  <div>{team.name}</div>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Allowed Wallets
                </span>
              </div>
            </div>
            <div className="my-2 flex gap-2">
              <div className="ml-auto">
                <AllowedWallets wallets={team.wallets} />
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Team Members
                </span>
              </div>
            </div>
            <div className="grid">
              <div className="ml-auto mr-16 mt-4">
                <TeamMembers members={team.members}/>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
