"use client";

import { PropsWithChildren } from "react";
import { env } from "@/env.mjs";

import { polkadotjs, UseInkathonProvider } from "@scio-labs/use-inkathon";

export default function ClientProviders({ children }: PropsWithChildren) {
  return (
    <UseInkathonProvider
      appName="relaycode"
      connectOnInit={true}
      defaultChain={env.NEXT_PUBLIC_DEFAULT_CHAIN as string}
    >
      {children}
    </UseInkathonProvider>
  );
}
