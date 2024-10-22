// pages/link-twitter.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

// pages/link-twitter.js

// pages/link-twitter.js

// pages/link-twitter.js

// pages/link-twitter.js

// pages/link-twitter.js

// pages/link-twitter.js

// pages/link-twitter.js

// pages/link-twitter.js

// pages/link-twitter.js

// pages/link-twitter.js

// pages/link-twitter.js

// pages/link-twitter.js

const LinkTwitter = () => {
  const { address, isConnected } = useAccount(); // Wallet address
  const { connect, connectors } = useConnect(); // Wallet connect
  const { disconnect } = useDisconnect(); // Wallet disconnect
  const [twitterData, setTwitterData] = useState(null); // Twitter data
  const [isTwitterConnected, setIsTwitterConnected] = useState(false); // Twitter connection status

  // Twitter Auth URL - replace this with your Twitter callback URL
  const twitterAuthUrl = "/api/get-twitter-auth-url";

  // Fetch Twitter data from backend (linked status)
  const fetchTwitterData = async () => {
    try {
      const { data } = await axios.get("/api/get-twitter-data");
      setTwitterData(data);
      setIsTwitterConnected(true);
    } catch (error) {
      console.error("Error fetching Twitter data", error);
      setIsTwitterConnected(false);
    }
  };

  // On mount, check if Twitter is connected
  useEffect(() => {
    fetchTwitterData();
  }, []);

  // Handle Twitter connect
  const handleTwitterConnect = async () => {
    try {
      const { data } = await axios.get(twitterAuthUrl);
      window.location.href = data.url; // Redirect to Twitter auth
    } catch (error) {
      console.error("Error connecting Twitter", error);
    }
  };

  // Handle link both (Twitter & Wallet)
  const handleLinkBoth = async () => {
    //   if (!address || !twitterData?.id) return;
    //   try {
    //     const { data } = await axios.post('/api/link-twitter-wallet', {
    //       address,
    //       twitterId: twitterData.id,
    //     });
    //     alert('Linked Successfully!');
    //   } catch (error) {
    //     console.error('Error linking Twitter and Wallet', error);
    //   }
  };

  return (
    <div className="dashboard-bg h-screen flex justify-center items-center">
      <div className="p-6 bg-white/10 backdrop-blur-md rounded-lg shadow-lg max-w-lg w-full mx-auto mt-12">
        <h1 className="text-2xl font-semibold text-center text-white mb-6">Connect to Twitter with your wallet</h1>

        {/* Step 1: Connect with Twitter/X */}
        <div className="mb-6">
          <h2 className="text-xl text-white mb-2">1. Connect with Twitter/X</h2>
          {isTwitterConnected ? (
            <p className="text-white">{/* Connected as: @{twitterData?.username || 'Fetching...'} */}</p>
          ) : (
            <button
              onClick={handleTwitterConnect}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition-colors duration-300"
            >
              Connect Twitter
            </button>
          )}
        </div>

        {/* Step 2: Connect Wallet */}
        <div className="mb-6">
          <h2 className="text-xl text-white mb-2">2. Connect Your Wallet</h2>
          {isConnected ? <p className="text-white">Connected Wallet: {address}</p> : <RainbowKitCustomConnectButton />}
        </div>

        {/* Step 3: Link Both */}
        <div className="mb-6">
          <h2 className="text-xl text-white mb-2">3. Link Both</h2>
          {isConnected && isTwitterConnected ? (
            <button
              onClick={handleLinkBoth}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg shadow-md transition-colors duration-300"
            >
              Link Wallet & Twitter
            </button>
          ) : (
            <p className="text-white">Please connect both Twitter and your wallet to proceed.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkTwitter;
