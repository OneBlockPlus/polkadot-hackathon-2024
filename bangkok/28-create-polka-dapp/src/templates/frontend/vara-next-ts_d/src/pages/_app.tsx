import Header from "@/components/Header";
import walletAggregator from "@/providers/walletProviderAggregator";
import "@/styles/globals.css";
import { PolkadotWalletsContextProvider } from "@/providers/PolkadotWalletsContext";

import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <PolkadotWalletsContextProvider walletAggregator={walletAggregator}>
      <Header />
      <Component {...pageProps} />
    </PolkadotWalletsContextProvider>
  );
}
