import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// import { getAllEvents } from "../MyTicket/ticketApi";

import logo from "../../assets/logos/logo.png";
import { events } from "../../data";

let eventData = events;
const EventGallery = () => {
  const [events, setEvents] = useState(eventData);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const formatDate = (dateString) => {
    const options = { month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };
  return (
    <>
      <nav className="container flex justify-between mx-auto items-center px-8 py-4">
        {/* Logo and Brand Name */}
        <Link to="/">
          <motion.div
            whileHover={{
              scale: 1.1,
            }}
            className="flex items-center"
          >
            <img src={logo} alt="BlockPass Logo" className="h-8 mr-2 " />
            <span className="text-black font-semibold text-lg">
              Block<span className="text-[#F5167E]">Pass</span>{" "}
            </span>
          </motion.div>
        </Link>
        {/* Hamburger Button */}
        <button
          className="md:hidden text-black hover:text-[#F5167E] focus:outline-none"
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
              d={
                isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
              }
            />
          </svg>
        </button>

        {/* Navigation Links */}
        <div
          className={`${
            isMenuOpen ? "block" : "hidden"
          } md:flex md:items-center md:space-x-6 absolute md:static top-16 left-0 w-full md:w-auto bg-black/30 md:bg-transparent p-4 md:p-0 z-10`}
        >
          {["Home", "Create", "My tickets"].map((text, index) => (
            <Link
              key={index}
              to={
                text === "Create"
                  ? "/create"
                  : `/${text.toLowerCase().replace(/\s+/g, "-")}` &&
                    text === "Home"
                  ? "/"
                  : `/${text.toLowerCase().replace(/\s+/g, "-")}` &&
                    text === "My tickets"
                  ? "/my-tickets"
                  : `/${text.toLowerCase().replace(/\s+/g, "-")}`
              }
              className="block md:inline-block text-black hover:text-[#F5167E] transition-colors duration-200 py-2 md:py-0"
            >
              {text}
            </Link>
          ))}
          <motion.button
            whileHover={{
              scale: 1.1,
            }}
            className="block md:inline-block text-white bg-purple-800 hover:bg-purple-900 px-4 py-2 rounded-full transition-colors duration-200 ring-2 ring-white ring-opacity-50 hover:ring-opacity-75"
          >
            Connect wallet
          </motion.button>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto my-10 p-8 ">
        <div
          className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl xl:-top-6"
          aria-hidden="true"
        >
          <div
            className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
        <h2 className="text-3xl font-bold text-gray-700 mb-6">
          EVENTS GALLERY
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {events.map((event) => (
            <motion.div
              whileHover={{ scale: 1.05 }}
              key={event.id}
              className="bg-white rounded-xl w-auto h-auto overflow-hidden shadow-lg"
            >
              <Link to={`/event/${event.id}`}>
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
                <div className="flex p-4">
                  <div className="flex-none mr-5 align-middle items-center">
                    <p className="text-gray-500 font-semibold">
                      {formatDate(event.date).split(" ")[0]}
                    </p>
                    <p className="text-black text-3xl font-bold">
                      {formatDate(event.date).split(" ")[1]}
                    </p>
                  </div>
                  <div className="flex-grow text-center flex flex-col justify-center">
                    <h3 className="text-sm text-start font-bold mb-2">
                      {event.title}
                    </h3>
                    <p className="text-gray-700 text-start text-xs">
                      {event.description}
                    </p>
                    <p className="text-gray-700 text-start mt-2 text-xs">
                      📍{event.location}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        <div
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
      </div>
    </>
  );
};

export default EventGallery;
