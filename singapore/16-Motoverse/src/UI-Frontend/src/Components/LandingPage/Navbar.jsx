/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import WalletConnection from "../walletConnect";

const Navbar = () => {

  const [isFixed, setIsFixed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const heroHeight = window.innerHeight;
      if (scrollPosition > heroHeight) {
        setIsFixed(true);
      } else {
        setIsFixed(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`self-stretch ${
        isFixed ? "fixed-top " : "sticky-top"
      } bg-white-50 ease-in-out duration-500 flex w-full h-auto items-center justify-between py-[8px] md:py-[10px] px-6 md:px-12 box-border z-[99] gap-auto text-center text-[18px] text-black shadow-md font-karla`}
    >

      <div className="flex items-center justify-center gap-[60px] max-w-full">

        <Link to="/" className="flex items-center justify-center gap-2">
          <img
            src="/images/newlogo.svg"
            className="shrink-0"
            loading="lazy"
            alt="Logo"
          />
          <h3 className="text-inherit min-[2000px]:text-2xl uppercase text-[20px] md:text-inherit font-medium font-inherit whitespace-nowrap">
            Motoverse
          </h3>
        </Link>
        <ul className="gap-[20px] text-[18px] hidden md:flex  min-[2000px]:text-2xl">
          <li>
            <Link to="/tech" className="relative leading-[130%]">
              Technology
            </Link>
          </li>
          <li>
            <Link to="/about" className="relative leading-[130%]">
              How it works
            </Link>
          </li>
        </ul>
      </div>
      <div className="flex flex-row items-center justify-center gap-[40px] max-w-full text-xl">
        <ul className="flex-1 flex flex-row items-center justify-between gap-[40px]">
          <li>
            <Link to="/dashboard" className="relative leading-[130%]">
              Dashboard
            </Link>
          </li>

          <li>
            <WalletConnection/>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Navbar;
