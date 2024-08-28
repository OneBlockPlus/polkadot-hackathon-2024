import React from "react";
import Link from "next/link";
import { FaGithub, FaTwitter } from "react-icons/fa";
import { SiFarcaster } from "react-icons/si";
import { ModeToggle } from "./mode-toggle";

const SiteFooter: React.FC = () => {
  return (
    <footer className="border-t">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center py-8">
        <div className="mb-4 md:mb-0">
          <h2 className="text-2xl font-bold font-mono">Relaycode</h2>
          <p className="mt-2">Simplifying Polkadot ecosystem interactions</p>
        </div>
        <div className="flex space-x-8">
          <p>&copy; 2024 Relaycode. All rights reserved.</p>
          <Link
            href="https://github.com/your-repo"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary"
          >
            <FaGithub size={24} />
          </Link>
          <Link
            href="https://twitter.com/your-handle"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary"
          >
            <FaTwitter size={24} />
          </Link>
          <Link
            href="https://warpcast.com/your-profile"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary"
          >
            <SiFarcaster size={24} />
          </Link>
          <ModeToggle />
        </div>
      </div>
    </footer>
  );
};

export { SiteFooter };
