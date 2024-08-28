import { useEffect } from 'react'
import { useNavigate, useRoutes } from 'react-router-dom'

import ImgLogo from '@/assets/images/common/logo.png'
import { Header } from '@/components/common/Header'
import { Toaster } from '@/components/ui/sonner'
import routes from '~react-pages'

function Redirect({ to }: { to: string }) {
  const navigate = useNavigate()
  useEffect(() => {
    navigate(to)
  }, [navigate, to])
  return null
}

export default function App() {
  return (
    <>
      <Header />
      <div className="mx-auto min-h-[calc(100vh-100px)]">
        {useRoutes([...routes, { path: '*', element: <Redirect to="/" /> }])}
      </div>
      <footer className="text-gary fixed bottom-0 w-full flex items-center justify-between border-t border-#00000011 bg-white px-8 py-4 text-sm text-gray">
        <div className="flex-center gap-x-1">
          <img src={ImgLogo} alt="" className="h-6 opacity-40" />
          OpenAuth
        </div>
        <a href="/privacy_policy.html" target="_blank">Privacy Policy</a>
      </footer>
      <Toaster />
    </>
  )
}
