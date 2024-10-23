import {TopBar} from "@/components/TopBar";
import {Provider} from "@/providers/Provider";
import type {Metadata} from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Blog3',
    description: '// TODO Desc for Blog3',
    formatDetection: {
        telephone: false,
        date: false,
        address: false,
        email: false,
    },

    icons: {
        icon: './icon.svg',
    },
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body className="dark">
        <Provider>
            <TopBar/>
            {children}
        </Provider>
        </body>
        </html>
    )
}