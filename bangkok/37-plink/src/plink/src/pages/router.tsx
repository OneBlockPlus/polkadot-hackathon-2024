import { createBrowserRouter } from "react-router-dom"
import Layout from "@/components/Layout/Layout"
import ProfilePage from "@/pages/Profile"
import MarketPage from "@/pages/Market"
import Apps from '@/pages/Apps'
import Dob from '@/pages/Dob'
import TokenPage from "@/pages/Token"
import CkbTokenPage from "@/pages/CkbToken"
import BtcTokenPage from "@/pages/BtcToken"
import Test from "@/pages/Test"
import DotBit from "@/pages/DotBit/DotBit"
import SwapPage from "@/pages/Swap"

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        errorElement: <div>error</div>,
        children: [
            { path: "/", element: <MarketPage /> },
            { path: "/address/:address", element: <ProfilePage /> },
            { path: "/market", element: <MarketPage /> },
            { path: "/apps", element: <Apps /> },
            { path: "/dob/:tokenid", element: <Dob /> },
            { path: "/token/:tokenid", element: <TokenPage /> },
            { path: "/token", element: <CkbTokenPage />},
            { path: "/bitcoin", element: <BtcTokenPage />},
            { path: "/test", element: <Test />},
            { path: "/dotbit/:domain", element: <DotBit />},
            { path: "/swap", element: <SwapPage />},
        ]
    },
]);

export default router
