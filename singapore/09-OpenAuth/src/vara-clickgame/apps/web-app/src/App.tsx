import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { useNavigate, useRoutes } from 'react-router-dom'

import bg1 from '@/assets/images/tabs/bg1.png'
import bg2 from '@/assets/images/tabs/bg2.png'
import bg3 from '@/assets/images/tabs/bg3.png'
import bg4 from '@/assets/images/tabs/bg4.png'
import bg5 from '@/assets/images/tabs/bg5.png'
import { Tabbar } from '@/components/layout/Tabbar'
import { useAutoLogIn } from '@/hooks/api'
import { cn } from '@/lib/utils'
import routes from '~react-pages'

function Redirect({ to }: { to: string }) {
  let navigate = useNavigate()
  useEffect(() => {
    navigate(to)
  }, [navigate, to])
  return null
}

function App() {
  useAutoLogIn()
  const bgImg = useBackgroundImage()
  const { pathname } = useLocation()
  const needFullWidth = pathname === '/'
  const needFullHeight = pathname === '/login'

  return (
    <div className="page-container">
      <img src={bgImg} className="w-full fixed bottom-0 z-0 h-full object-cover" alt="" />
      <div className={cn('page-content', needFullWidth ? '' : 'px-4', needFullHeight ? 'h-full' : '')}>
        {useRoutes([...routes, { path: '*', element: <Redirect to="/" /> }])}
      </div>
      <div className={cn('fixed bottom-0 w-full h-24', pathname === '/login' ? '!hidden' : '')}>
        <Tabbar />
      </div>
    </div>
  )
}

export default App

function useBackgroundImage() {
  const { pathname } = useLocation()
  return useMemo(() => {
    switch (true) {
      case pathname.startsWith('/leaderboard'):
        return bg2
      case pathname.startsWith('/earn'):
        return bg3
      case pathname.startsWith('/referral'):
        return bg4
      case pathname.startsWith('/wallet'):
        return bg5
      default:
        return bg1
    }
  }, [pathname])
}
