import { IconCode, IconHome, IconKey, IconPalette, IconSettings, IconUser, IconWebhook } from '@tabler/icons-react'
import { NavLink, useLocation, useParams } from 'react-router-dom'

import { cn } from '@/utils/css'

export function AppTabs() {
  const { id = '' } = useParams()
  return (
    <div className="flex flex-col gap-1 border-r">
      <Tab icon={<IconHome size={18} />} path={`/apps/${id}`} title="Home" />
      <Tab icon={<IconPalette size={18} />} path={`/apps/${id}/branding`} title="Branding" />
      <Tab icon={<IconKey size={18} />} path={`/apps/${id}/login-methods`} title="Login Methods" />
      <Tab icon={<IconUser size={18} />} path={`/apps/${id}/users`} title="Users" />
      <Tab icon={<IconCode size={18} />} path={`/apps/${id}/api-keys`} title="API Keys" />
      <Tab icon={<IconWebhook size={18} />} path={`/apps/${id}/domains`} title="Domains" />
      <Tab icon={<IconSettings size={18} />} path={`/apps/${id}/settings`} title="Settings" />
    </div>
  )
}

function Tab({ title, path, icon }: { title: string, path: string, icon: any }) {
  const { pathname } = useLocation()
  return (
    <NavLink
      to={path}
      className={cn(
        'w-48 pr-8 py-2 flex flex-row items-center gap-1 hover:text-foreground border-r-1.5',
        pathname === path ? 'font-bold text-foreground border-foreground' : 'text-muted-foreground border-transparent',
      )}
    >
      <div>{icon}</div>
      <div>{title}</div>
    </NavLink>
  )
}
