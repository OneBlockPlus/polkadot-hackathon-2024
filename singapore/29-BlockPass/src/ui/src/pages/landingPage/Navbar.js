/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logos/logo.png";
import { motion } from "framer-motion";

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="container flex justify-between lg:relative mx-auto items-center px-8 py-4">
      {/* Logo and Brand Name */}
      <Link to="/">
        <motion.div
          whileHover={{
            scale: 1.1,
          }}
          className="flex items-center"
        >
          <img src={logo} alt="BlockPass Logo" className="h-8 mr-2" />
          <span className="text-white font-semibold text-lg">BlockPass</span>
        </motion.div>
      </Link>
      {/* Hamburger Button */}
      <button
        className="md:hidden text-white hover:text-[#F5167E] focus:outline-none"
        onClick={toggleMenu}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>

      {/* Navigation Links */}
      <div
        className={`${
          isMenuOpen ? "block" : "hidden"
        } md:flex md:items-center md:space-x-6 absolute md:static top-16 left-0 w-full md:w-auto bg-black/30 md:bg-transparent p-4 md:p-0 z-10`}
      >
        <Link
          to="/create"
          className="block md:inline-block text-white hover:text-[#F5167E] transition-colors duration-200 py-2 md:py-0"
          onClick={toggleMenu}
        >
          Create
        </Link>
        <Link
          to={"/events"}
          className="block md:inline-block text-white hover:text-[#F5167E] transition-colors duration-200 py-2 md:py-0"
          onClick={toggleMenu}
        >
          All Events
        </Link>
     
        <Link
          to={"/my-tickets"}
          className="block md:inline-block text-white hover:text-[#F5167E] transition-colors duration-200 py-2 md:py-0"
          onClick={toggleMenu}
        >
          My tickets
        </Link>
        {/* Connect Button */}
        <motion.button
          whileHover={{
            scale: 1.1,
          }}
          className="block md:inline-block text-white bg-purple-800/30 hover:bg-purple-900 px-4 py-2 rounded-full transition-colors duration-200 ring-2 ring-white ring-opacity-50 hover:ring-opacity-75"
        >
          Connect Wallet
        </motion.button>
      </div>
    </nav>
  );
};

export default NavBar;
