"use client";

import React, { useCallback, useRef, useState } from "react";
// import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon, BugAntIcon } from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Staking",
    href: "/dashboard",
  },
  {
    label: "Leaderboard",
    href: "/leaderboard",
  },
  // {
  //   label: "airdrop",
  //   href: "/dashboard",
  // },

  // {
  //   label: "Debug Contracts",
  //   href: "/debug",
  //   icon: <BugAntIcon className="h-4 w-4" />,
  // },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive ? "bg-secondary text-white shadow-md" : "text-gray-300 hover:bg-gray-700 hover:text-white"
              } px-3 py-2 rounded-md text-sm font-medium grid grid-flow-col gap-2`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 w-11/12 max-w-7xl z-50">
      <div className="backdrop-filter backdrop-blur-lg bg-white bg-opacity-10 border border-gray-200 border-opacity-20 rounded-full shadow-lg">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Logo Section */}
          <Link href="/" passHref className="flex items-center text-2xl text-white">
            <span className="merriweather-regular">
              Luna<span className="text-[#07d3ba]">Cred</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex">
            <ul className="ml-10 flex space-x-4">
              <HeaderMenuLinks />
            </ul>
          </div>

          {/* Wallet Connection & FaucetButton */}
          <div className="hidden lg:flex">
            <RainbowKitCustomConnectButton />
            <FaucetButton />
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              {isDrawerOpen ? <Bars3Icon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden ${isDrawerOpen ? "block" : "hidden"} mt-2`}>
          <div className="backdrop-filter backdrop-blur-lg bg-white bg-opacity-10 border border-gray-200 border-opacity-20 rounded-lg shadow-lg px-2 pt-2 pb-3">
            <ul>
              <HeaderMenuLinks />
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};
