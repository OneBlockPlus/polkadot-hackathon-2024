import { useLocation } from 'react-router'
import { NavLink } from 'react-router-dom'

// import earnImg from '@/assets/images/tabs/earn.png'
import leaderboardImg from '@/assets/images/tabs/leaderboard.png'
import referralImg from '@/assets/images/tabs/referral.png'
import homeImg from '@/assets/images/tabs/v.png'
import walletImg from '@/assets/images/tabs/wallet.png'
import { cn } from '@/lib/utils'

const tabs = [
  {
    icon: homeImg,
    label: 'Home',
    path: '/',
  },
  {
    icon: leaderboardImg,
    label: 'Leaderboard',
    path: '/leaderboard',
  },
  // {
  //   icon: earnImg,
  //   label: 'Earn',
  //   path: '/earn',
  // },
  {
    icon: referralImg,
    label: 'Referral',
    path: '/referral',
  },
  {
    icon: walletImg,
    label: 'Wallet',
    path: '/wallet',
  },
]

export function Tabbar() {
  const { pathname } = useLocation()
  return (
    <div className="flex items-center bg-#000000DD h-full">
      {tabs.map(({ icon, label, path }) => (
        <NavLink to={path} key={label} className="flex-col-center flex-1 font-mosaic">
          <img src={icon} className="w-7 h-7" alt="" />
          <div className={cn(pathname === path ? 'text-[--primary]' : '', 'text-center text-lg')}>{label}</div>
        </NavLink>
      ))}
    </div>
  )
}
