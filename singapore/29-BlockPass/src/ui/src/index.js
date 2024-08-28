import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Web3OnboardProvider } from '@subwallet-connect/react'
import web3Onboard from "./web3-onboard";
import { BrowserRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ChakraProvider>
      <BrowserRouter>
        <Web3OnboardProvider web3Onboard={web3Onboard}>
          <App />
        </Web3OnboardProvider>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
);
