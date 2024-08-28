/*
 * @Descripttion:
 * @version: 1.0
 * @Author: Hesin
 * @Date: 2024-08-25 12:23:06
 * @LastEditors: Hesin
 * @LastEditTime: 2024-08-26 16:45:57
 */
"use client";

import type * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { moonbaseAlpha } from "wagmi/chains";

export const config = getDefaultConfig({
	appName: "RainbowKit demo",
	projectId: "YOUR_PROJECT_ID",
	chains: [
		moonbaseAlpha,
		...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true"
			? [moonbaseAlpha]
			: []),
	],
	ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				<RainbowKitProvider
					theme={darkTheme({
						accentColor: "#2bff9c",
						accentColorForeground: "#1c1c22",
					})}
				>
					{children}
				</RainbowKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
}
