import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const Navbar: React.FC = () => {
  // Placeholder for wallet connection logic
  const isWalletConnected = false;
  const accountDetails = "0x1234...5678";

  return (
    <nav className="border-b">
      <div className="container mx-auto flex justify-between items-center py-4">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold font-mono">
            Relaycode
          </Link>
        </div>
        <div className="space-x-4">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <Link href="/builder" className="hover:text-primary">
            Builder
          </Link>
          <Link href="/snippets" className="hover:text-primary">
            Snippets
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          {isWalletConnected ? (
            <span className="font-mono">{accountDetails}</span>
          ) : (
            <Button variant="outline">Connect Wallet</Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export { Navbar };
