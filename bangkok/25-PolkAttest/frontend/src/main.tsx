import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import { WalletProvider } from "./components/contexts/AccountContext.tsx";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChakraProvider>
      <WalletProvider>
        <App />
      </WalletProvider>
    </ChakraProvider>
  </StrictMode>
);
