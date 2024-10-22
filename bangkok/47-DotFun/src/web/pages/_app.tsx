import type { AppType } from 'next/app'
import Head from 'next/head'
import { trpc } from '@/utils/trpc'
import WalletContextProvider from '../providers/WalletContextProvider'
import { Header } from '@/components/Header'
import { CookiesProvider } from 'react-cookie'
import { Toaster } from '@/components/ui/sonner'
import '../global.css'
import { cn } from '@/lib/utils'
import { baseFont } from '@/utils/fonts'

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <DotContext>
      <Head>
        <meta charSet="UTF-8" />
        <link rel="icon" href="/logo.png" />
        <meta content="width=device-width, initial-scale=1.0" name="viewport" />
        <title>DotFun</title>
      </Head>
      <CookiesProvider>
        <div
          className={cn(baseFont.className, 'flex flex-col bg-background overflow-hidden h-screen w-screen relative')}
        >
          <Header />
          <div className="w-full h-[calc(100vh-64px)] overflow-y-auto">
            <Component {...pageProps} />
          </div>
        </div>
        <Toaster richColors />
      </CookiesProvider>
    </DotContext>
  )
}
export default trpc.withTRPC(MyApp)
