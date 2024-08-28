import { useOpenAuth } from '@open-auth/sdk-react'
import { IconBook, IconBrandGithub, IconLayoutDashboard } from '@tabler/icons-react'
import { NavLink } from 'react-router-dom'

import ImgLogo from '@/assets/images/common/logo.png'
import { NavButton } from '@/components/common/NavButton'

export function Header() {
  const { config } = useOpenAuth()
  return (
    <header className="w-full">
      <div className="mx-auto flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2">
          <NavLink className="flex items-center" to="/">
            <img src={ImgLogo} alt="" className="h-8" />
          </NavLink>
          <NavButton className="flex-center hover:text-primary" to="/demo">
            Demo
          </NavButton>
        </div>
        <div className="flex-center">
          <NavButton className="flex-center hover:text-primary" to="https://github.com/openauth-tech">
            <IconBrandGithub size={20} />
            GitHub
          </NavButton>
          <NavButton className="flex-center hover:text-primary" to={`${config.endpoint}/docs/`}>
            <IconBook size={20} />
            API Docs
          </NavButton>
          <NavButton className="flex-center hover:text-primary" to="https://admin.openauth.tech">
            <IconLayoutDashboard size={20} />
            Admin Portal
          </NavButton>
        </div>
      </div>
    </header>
  )
}
