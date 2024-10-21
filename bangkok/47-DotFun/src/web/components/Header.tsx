import IconLogo from '@/assets/images/logo.svg'
import Link from 'next/link'
import { ProfileButton } from './ProfileButton'
import { IconMenu2 } from '@tabler/icons-react'
export function Header() {
  return (
    <div className="flex w-full fix top-0 bg-background z-50 shrink-0 h-16 lg:h-24  flex-col">
      <div className="flex w-full items-center justify-between shrink-0 flex-grow py-2">
        <div className="flex items-center h-full gap-2 px-4">
          <Link href={'/'} className="flex gap-2 items-center cursor-pointer">
            <IconLogo />
            <div className="font-black text-2xl">DotFun</div>
          </Link>

          <div className="px-3 hidden lg:block">|</div>

          <div className="gap-3 items-center hidden lg:flex">
            <div className="px-2">How It Works</div>
            <div> Support</div>
          </div>
        </div>
        <div className="hidden lg:flex justify-between items-center px-2">
          <ProfileButton />
        </div>
        <div className="flex lg:hidden justify-between items-center px-2">
          <IconMenu2 />
        </div>
      </div>
    </div>
  )
}
