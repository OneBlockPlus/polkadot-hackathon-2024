'use client'
import Link from 'next/link'
import { Bell, Home, LineChart, Package, Package2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { SidebarNavLink } from '@/app/acme/layouts/sidebar-nav-link'


export function Sidebar() {
  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link
            href="/public"
            className="flex items-center gap-2 font-semibold">
            <Package2 className="h-6 w-6" />
            <span className="">Acme Inc</span>
          </Link>
          <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <SidebarNavLink
              path={'/dashboard'}
              name={'Dashboard'}
              Icon={Home}
            />
            <SidebarNavLink path={'/wallets'} name={'Wallets'} Icon={Package} />
            {/*<SidebarNavLink path={'/employees'} name={'Employees'} Icon={Package} />*/}

            <SidebarNavLink path={'/teams'} name={'Teams'} Icon={Users} />
            <SidebarNavLink
              path={'/transactions'}
              name={'Transactions'}
              Icon={Users}
            />
            <SidebarNavLink
              path={'/analytics'}
              name={'Analytics'}
              Icon={LineChart}
            />
          </nav>
        </div>
        <div className="mt-auto p-4">
          <Card x-chunk="dashboard-02-chunk-0">
            <CardHeader className="p-2 pt-0 md:p-4">
              <CardTitle>Upgrade to Pro</CardTitle>
              <CardDescription>
                Unlock all features and get unlimited access to our support
                team.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
              <Button size="sm" className="w-full">
                Upgrade
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
