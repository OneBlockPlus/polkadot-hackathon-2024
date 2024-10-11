import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Twitter from '../assets/twitter.svg';
import Discord from '../assets/discord.svg';
// import { ConnectButton } from '@rainbow-me/rainbowkit';
import { AiOutlineClose, AiOutlineMenu } from 'react-icons/ai';
import { Button } from '@mui/material';
import useTheme from "../context/theme";
import { useEthers } from '@usedapp/core';
//this is navbar for lunacred
function Navbar() {
  const { pathname } = useLocation();
  const [activeRoute, setActiveRoute] = useState('');

  const { activateBrowserWallet, deactivate, account } = useEthers();

  // Handle the wallet toggle
  const handleWalletConnection = () => {
    if (account) deactivate();
    else activateBrowserWallet();
  };

  useEffect(() => {
    setActiveRoute(pathname);
    handleNav();
  }, [pathname]);

  // State to manage the navbar's visibility
  const [nav, setNav] = useState(false);

  // Toggle function to handle the navbar's display
  const handleNav = () => {
    setNav(!nav);
  };
  // Dark Mode
  const { themeMode, brightTheme, darkTheme } = useTheme();
  const onChangeBtn = (e) => {
    const darkModeStatus = e.currentTarget.checked;
    if (darkModeStatus) {
      darkTheme();
    } else {
      brightTheme();
    }
  };
  console.log("themeMode", themeMode);

  // Array containing navigation items
  const navItems = [
    { id: 1, text: 'Home', to: '/' },
    { id: 2, text: 'Airdrop', to: '/airdrop' },
    { id: 3, text: 'Credibility staking', to: '/staking' },
    { id: 4, text: 'Leaderboard', to: '/leaderboard' },
  ];

  return (
    <div className='nav-container font-mono flex flex-1 justify-between backdrop-blur-lg bg-white/10  h-[10vh] mx-auto text-black  dark:text-white max-w-[90%] border-white/30 border'>
      {/* Logo */}
      <div className='flex  content-center'>
        <Link
          className='text-3xl font-semibold text-white flex items-center justify-self-start gap-2 tracking-wider'
          to={'/'}
        >
            {" "}
          {themeMode !== null && themeMode === "dark" ? (
            // <img height={150} width={150} src={Mande}></img><>
            <>LunaCred</>
          ) : (
            <>LunaCred</>
            // <img height={150} width={150} src={MandeLogodark}></img>
          )}
        </Link>
      </div>
      <div className='flex content-center justify-end w-full'>
        {/* Desktop Navigation */}
        <ul className='navbar-left-container gap-8 md:flex items-center justify-self-end hidden'>
          {navItems.map(item => (
            <Link
              to={item.to}
              className={`${
                activeRoute == item.to
                  ? 'text-[#7071E8] font-bold'
                  : 'dark:text-white'
              }   text-[18px]`}
            >
              {item.text}
            </Link>
          ))}
         {/* <a href="https://twitter.com/MandeNetwork" target="_blank">
            {themeMode !== null && themeMode === "dark" ? (
              <img
                src={Twitter}
                width={25}
                height={25}
                className="cursor-pointer"
              ></img>
            ) : (
              <img
                src={twitterdark}
                width={25}
                height={25}
                className="cursor-pointer"
              ></img>
            )}
          </a> */}
          {/* <a href="https://discord.gg/9Ugch3fRC2" target="_blank">
            {themeMode !== null && themeMode === "dark" ? (
              <img
                src={Discord}
                width={25}
                height={25}
                className="cursor-pointer"
              ></img>
            ) : (
              <img
                src={discorddark}
                width={25}
                height={25}
                className="cursor-pointer"
              ></img>
            )}
          </a> */}
          <div className='text-[18px]'>
             <Button variant='contained' onClick={handleWalletConnection}>
            {account
              ? `Disconnect ${account.substring(0, 5)}...`
              : 'Connect Wallet'}
          </Button>
          </div>
        
        </ul>

        {/* Mobile Connect wallet and Navigation Icon */}
        {!nav && <div className='content-center block md:hidden text-[12px] pr-2'>
            <Button variant='contained' onClick={handleWalletConnection}>
            {account
              ? `Disconnect ${account.substring(0, 5)}...`
              : 'Connect Wallet'}
          </Button>
        </div>}
        <div onClick={handleNav} className='content-center block md:hidden'>
          {nav ? <AiOutlineClose size={20} /> : <AiOutlineMenu size={20} />}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <ul
        className={
          nav
            ? "flex flex-col z-50 fixed md:hidden left-0 top-0 w-[60%] h-full border-r dark:border-r-gray-900 text-white bg-black  dark:bg-[#000300] ease-in-out duration-500"
            : "ease-in-out w-[60%] duration-500 fixed top-0 bottom-0 left-[-100%]"
        }
      >
        {/* Mobile Logo */}
        <Link
          className="p-4 text-3xl font-semibold text-white bg-black dark:text-white flex items-center gap-2 tracking-wider"
          to={"/"}
        >
          <img
            height={100}
            width={100}
             alt={"image"}src={themeMode === "dark" ? "luna light" : "luna dark"}
          ></img>
        </Link>

        {/* Mobile Navigation Items */}
        {navItems.map((item) => (
          <Link
            to={item.to}
            className={`${
              activeRoute == item.to
                ? "text-[black] font-bold"
                : ""
            }  p-4 cursor-pointer text-[18px]`}
          >
            {item.text}
          </Link>
        ))}
     

        <a
          href="https://twitter.com/MandeNetwork"
          target="_blank"
          className="p-4"
        >
          {/* <img
            src={themeMode === "dark" ? Twitter : twitterdark}
            width={25}
            height={25}
            className="cursor-pointer"
          ></img> */}
        </a>
        <a href="https://discord.gg/9Ugch3fRC2" target="_blank" className="p-4">
          {/* <img
            src={themeMode === "dark" ? Discord : discorddark}
            width={25}
            height={25}
            className="cursor-pointer"
          ></img> */}
        </a>
      </ul>
    </div>
  );
}

export default Navbar;
