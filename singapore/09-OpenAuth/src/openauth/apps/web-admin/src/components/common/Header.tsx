import { IconLogout, IconUser } from '@tabler/icons-react'
import { NavLink } from 'react-router-dom'

import ImgLogo from '@/assets/images/common/logo.png'
import { NavButton } from '@/components/common/NavButton'
import { useAdmin } from '@/context/admin'

export function Header() {
  const { username } = useAdmin()
  return (
    <header className="w-full">
      <div className="mx-auto mx-auto flex items-center justify-between py-4 container lt-sm:px-4">
        <div className="flex items-center gap-2">
          <NavLink className="flex items-center" to="/">
            <img src={ImgLogo} alt="" className="h-8" />
          </NavLink>
          {username && (
            <>
              <NavButton className="flex-center hover:text-primary" to="/admins">
                Admins
              </NavButton>
              <NavButton className="flex-center hover:text-primary" to="/apps">
                Apps
              </NavButton>
            </>
          )}
        </div>
        <div className="flex-center">
          {username ? (
            <NavButton className="flex-center text-red-6 hover:text-primary" to="/login">
              <IconLogout size={20} />
              Log Out
            </NavButton>
          ) : (
            <NavButton className="flex-center hover:text-primary" to="/login">
              <IconUser size={20} />
              Log In
            </NavButton>
          )}
        </div>
      </div>
    </header>
  )
}
