import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.js";
import "./index.css";
import { PolkadotWalletsContextProvider } from "@polkadot-onboard/react";
import walletAggregator from "./providers/walletProviderAggregator.tsx";
import Header from "./components/Header.tsx";

const rootElement = document.getElementById("root");

if (rootElement)
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <PolkadotWalletsContextProvider walletAggregator={walletAggregator}>
        <Header />
        <App />
      </PolkadotWalletsContextProvider>
    </React.StrictMode>
  );
