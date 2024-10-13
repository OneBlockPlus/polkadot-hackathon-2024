import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AiOutlineClose, AiOutlineMenu } from 'react-icons/ai';
import { Button } from '@mui/material';
import useTheme from "../context/theme";
import { useEthers } from '@usedapp/core';

function Navbar() {
  const { pathname } = useLocation();
  const [activeRoute, setActiveRoute] = useState('');
  const [nav, setNav] = useState(false);
  const { activateBrowserWallet, deactivate, account } = useEthers();
  const { themeMode, brightTheme, darkTheme } = useTheme();

  const handleWalletConnection = () => {
    if (account) deactivate();
    else activateBrowserWallet();
  };

  const handleNav = () => {
    setNav(!nav);
  };

  useEffect(() => {
    setActiveRoute(pathname);
    setNav(false);
  }, [pathname]);

  const navItems = [
   
    { id: 2, text: 'Airdrop', to: '/airdrop' },
    { id: 3, text: 'Credibility staking', to: '/staking' },
    { id: 4, text: 'Leaderboard', to: '/leaderboard' },
  ];

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 w-11/12 max-w-7xl z-50">
      <div className="backdrop-filter backdrop-blur-lg bg-white bg-opacity-10 border border-gray-200 border-opacity-20 rounded-full shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 text-2xl text-white" >
              <span className="merriweather-regular">
               Luna<span className="text-[#07d3ba]">Cred</span>   </span> 
              
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.id}
                    to={item.to}
                    className={`${
                      activeRoute === item.to
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    } px-3 py-2 rounded-md text-sm font-medium`}
                  >
                    {item.text}
                  </Link>
                ))}
              </div>
            </div>
            <div className="hidden md:block">
              <Button
                variant="contained"
                onClick={handleWalletConnection}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                {account
                  ? `Disconnect ${account.substring(0, 5)}...`
                  : 'Connect Wallet'}
              </Button>
            </div>
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={handleNav}
                type="button"
                className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              >
                <span className="sr-only">Open main menu</span>
                {nav ? (
                  <AiOutlineClose className="block h-6 w-6" />
                ) : (
                  <AiOutlineMenu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div 
          className={`${
            nav ? 'block' : 'hidden'
          } md:hidden absolute top-full left-0 w-full mt-2`}
        >
          <div className="backdrop-filter backdrop-blur-lg bg-white bg-opacity-10 border border-gray-200 border-opacity-20 rounded-lg shadow-lg px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={item.to}
                className={`${
                  activeRoute === item.to
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } block px-3 py-2 rounded-md text-base font-medium`}
              >
                {item.text}
              </Link>
            ))}
            <Button
              variant="contained"
              onClick={handleWalletConnection}
              className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              {account
                ? `Disconnect ${account.substring(0, 5)}...`
                : 'Connect Wallet'}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;