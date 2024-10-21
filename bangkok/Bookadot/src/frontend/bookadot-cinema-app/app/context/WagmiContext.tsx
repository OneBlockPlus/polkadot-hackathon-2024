"use client"

import { WagmiProvider, State as WagmiState } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react';
import { wagmiAdapter } from '../utils/wagmiConfig';
import { createAppKit } from '@reown/appkit/react'
import { moonbaseAlpha } from 'viem/chains';


const queryClient = new QueryClient()

// Create the modal
createAppKit({
    adapters: [wagmiAdapter],
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID || "",
    networks: [moonbaseAlpha],
    defaultNetwork: moonbaseAlpha,
})

export const WagmiContext = ({ children, initialState }: { children: ReactNode, initialState?: WagmiState }) => {
    return (
        <WagmiProvider initialState={initialState} config={wagmiAdapter.wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    )
}