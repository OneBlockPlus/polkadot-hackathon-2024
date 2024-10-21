import { trpc } from '@/utils/trpc'
import { useRouter } from 'next/router'
import { format } from 'date-fns'
import { ProfileCard } from '@/components/ProfileCard'
import { CollapsibleSection } from '@/components/CollapsibleSection'
import { AppCard } from '@/components/AppCard'
import { ScrollArea } from '@/components/ui/scroll-area'
import ActivityCalendar from 'react-activity-calendar'
import { skipToken } from '@tanstack/react-query'

export default function Profile() {
  const router = useRouter()
  const { id } = router.query as { id?: string }
  const { data: userProfile } = trpc.user.profile.getProfile.useQuery(id ? { id } : skipToken)

  return (
    <div className="h-full px-2 lg:px-6 py-4 flex gap-4 overflow-y-scroll  lg:overflow-hidden  flex-col lg:flex-row items-center lg:items-start">
      <ProfileCard profile={userProfile} />
      <ScrollArea className="h-full w-full flex-grow px-4">
        <CollapsibleSection header="My Apps">
          <div className="mx-auto grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2 w-full mt-6 px-2">
            {userProfile?.apps.map((app) => <AppCard size="sm" key={app.id} {...app} />)}
          </div>
        </CollapsibleSection>
        <CollapsibleSection header="Recent Activity">
          <div className="flex flex-col gap-2">
            {userProfile && userProfile.activities.length > 0 ? (
              userProfile.activities.map((activity) => (
                <div className="w-full bg-secondary rounded-md p-4">
                  <div>{activity.title}</div>
                  <div className="text-xs text-foreground/60 my-1">
                    {format(activity.createdAt, 'MM/dd/yyyy, hh:mm:ss a')}
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full bg-secondary rounded-md p-4">No activities</div>
            )}
          </div>
        </CollapsibleSection>
        <CollapsibleSection header="Commit Activity">
          <div className="flex items-center w-full bg-secondary p-4 rounded-md [&>*:first-child]:w-full ">
            <ActivityCalendar
              loading={!userProfile}
              hideTotalCount={true}
              hideColorLegend={true}
              theme={{
                light: ['hsla(0,0%,98%,0.2)', 'hsl(148,61%,57%)'],
                dark: ['hsla(0,0%,98%,0.2)', 'hsl(148,61%,57%)'],
              }}
              data={
                userProfile?.activitiesHeatmap.map(({ date, count }) => ({
                  date,
                  count,
                  level: Math.min(4, count),
                })) ?? []
              }
            />
          </div>
        </CollapsibleSection>
      </ScrollArea>
    </div>
  )
}
