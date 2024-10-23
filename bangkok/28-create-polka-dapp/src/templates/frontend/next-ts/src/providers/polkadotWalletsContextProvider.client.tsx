"use client";
import * as onboardReact from "@polkadot-onboard/react";
import walletAggregator from "@/providers/walletProviderAggregator";

export const PolkadotWalletsContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <onboardReact.PolkadotWalletsContextProvider
      walletAggregator={walletAggregator}
    >
      {children}
    </onboardReact.PolkadotWalletsContextProvider>
  );
};
