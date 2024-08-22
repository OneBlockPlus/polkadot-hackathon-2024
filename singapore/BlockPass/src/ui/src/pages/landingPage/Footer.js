/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { Link } from "react-router-dom";

import logo from "../../assets/logos/logo.png";
import facebook from "../../assets/logos/facebook.png";
import twitter from "../../assets/logos/twitter.png";
import linkedin from "../../assets/logos/linkedin.png";

const Footer = () => {
  return (
    <footer className="bg-[#0A075F] text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-4">
          <div className="col-span-2 mt-5 items-center justify-center text-start lg:col-span-1">
            <Link to="/">
              <div className="flex mb-4 items-center">
                <img src={logo} alt="BlockPass Logo" className="h-8 mr-2" />
                <span className="text-white font-semibold text-lg">
                  BlockPass
                </span>
              </div>
            </Link>
            {/* <h3 className="text-lg font-semibold mb-4">FoodChop</h3> */}
            <p className="text-white text-sm">
              BlockPass is a global self-service ticketing platform for live
              experiences that allows anyone to create, share, find and attend
              events that fuel their passions and enrich their lives.
            </p>

            <div className="flex space-x-4 mt-4">
              <a href="#">
                <img
                  src={facebook}
                  alt="facebook"
                />
              </a>

              <a href="#">
                <img
                  src={twitter}
                  alt="twitter"
                />
              </a>
              <a href="#">
                <img
                  src={linkedin}
                  alt="linkedin"
                />
              </a>
            </div>
          </div>
          <div className="lg:ml-40 ml-8">
            <h4 className="text-lg font-semibold mb-4">Plan Events</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className=" hover:text-gray-800">
                  Create and Set Up
                </a>
              </li>
              <li>
                <a href="#" className=" hover:text-gray-800">
                  Sell Tickets
                </a>
              </li>
              <li>
                <a href="#" className=" hover:text-gray-800">
                  Online RSVP
                </a>
              </li>
              <li>
                <a href="#" className=" hover:text-gray-800">
                  Online Events
                </a>
              </li>
            </ul>
          </div>
          <div className="lg:ml-10 mr-16 ">
            <h4 className="text-lg font-semibold mb-4">Eventick</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className=" hover:text-gray-800">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className=" hover:text-gray-800">
                  Press
                </a>
              </li>
              <li>
                <a href="#" className=" hover:text-gray-800">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className=" hover:text-gray-800">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className=" hover:text-gray-800">
                  How it Works
                </a>
              </li>
              <li>
                <a href="#" className=" hover:text-gray-800">
                  Privacy
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Stay in the loop</h4>
            <p>
              Join our mailing list to stay in the loop with our newest for
              Event and concert
            </p>
            <div className="flex lg:relative items-center mt-4">
              <input
                type="email"
                placeholder="Enter your email address..."
                className="bg-white text-gray-800 px-5 py-2 lg:w-[364px] lg:h-[61px] rounded-full focus:outline-none"
              />
              <button className="bg-[#F5167E] lg:absolute right-5 text-white lg:px-6 lg:py-3 px-4 py-2 ml-5 rounded-full">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        <hr className="my-6 border-gray-100/20" />
        <p className="text-center text-white text-sm">
          &copy; 2024 BlockPass. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
