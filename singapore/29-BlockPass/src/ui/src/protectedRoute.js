import React from "react";
import { useWallet } from "./wallet-context.js";
import ConnectWalletModal from "./components/ConnectWalletModal";
import { useNavigate } from "react-router-dom"; // import your modal component

const ProtectedRoute = ({ children }) => {
  const { isConnected } = useWallet();

  const navigate = useNavigate();

  if (!isConnected) {
    return <ConnectWalletModal navigate={navigate} />; // Display modal instead of navigating away
  }

  return children;
};

export default ProtectedRoute;
