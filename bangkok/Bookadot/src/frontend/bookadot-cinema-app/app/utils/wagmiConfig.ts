import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { createPublicClient } from "viem";
import { moonbaseAlpha } from "viem/chains";
import { http } from "wagmi";

export const wagmiAdapter = new WagmiAdapter({
    networks: [moonbaseAlpha],
    cacheTime: 4_000,
    pollingInterval: 4_000,
    transports: {
        [moonbaseAlpha.id]: http()
    },
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID || "",
})

export const publicClient = createPublicClient({
    chain: moonbaseAlpha,
    transport: http()
})
