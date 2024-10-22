//@ts-nocheck



"use client"
import '@rainbow-me/rainbowkit/styles.css';

import * as React from "react"
import {
    QueryClient,
    QueryClientProvider,
  } from '@tanstack/react-query'
  import {
    getDefaultConfig,
    RainbowKitProvider,
  } from '@rainbow-me/rainbowkit';
  import { WagmiProvider } from 'wagmi';
  import {
    moonbaseAlpha,
    moonbeam,
    moonriver
  } from 'wagmi/chains';
  const queryClient  =  new QueryClient
  const config = getDefaultConfig({
    appName: 'My RainbowKit App',
    projectId: 'YOUR_PROJECT_ID',
    chains: [moonbaseAlpha, moonbeam, moonriver],
    ssr: false, // If your dApp uses server side rendering (SSR)
  });
export function ClientProviders({ children}) {
  return (
    <WagmiProvider config={config}>
  <QueryClientProvider client={queryClient} >
    <RainbowKitProvider>
    {children}
    </RainbowKitProvider>
   </QueryClientProvider>
    </WagmiProvider>
)}
