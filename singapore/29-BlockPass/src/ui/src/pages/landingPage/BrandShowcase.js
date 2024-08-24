import React from "react";
import { motion } from "framer-motion";

import logoPolkadot from "../../assets/logos/polkadot.png";
import logoGoogle from "../../assets/logos/google.png";
import logoStripe from "../../assets/logos/stripe.png";
import logoYoutube from "../../assets/logos/youtube.png";
import logoMicrosoft from "../../assets/logos/microsoft.png";
import logoMedium from "../../assets/logos/medium.png";
import logoZoom from "../../assets/logos/zoom.png";
import logoUber from "../../assets/logos/uber.png";
import logoGrab from "../../assets/logos/grab.png";

const BrandShowcase = () => {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="text-center text-4xl font-bold leading-8 text-[#242565]">
          Join these brands
        </h2>
        <p className="text-gray-400 text-center mt-5 mb-8">
          We've had the pleasure of working with industry-defining brands. These
          are just some of them.
        </p>
        <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
          <motion.img
            whileHover={{ scale: 1.1 }}
            className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
            src={logoGoogle}
            alt="google"
            width={158}
            height={48}
          />
          <motion.img
            whileHover={{ scale: 1.1 }}
            className="col-span-2 max-h-16 w-full object-contain lg:col-span-1"
            src={logoStripe}
            alt="stripe"
            width={158}
            height={48}
          />
          <motion.img
            whileHover={{ scale: 1.1 }}
            className="col-span-2 max-h-14 w-full pl-5 lg:col-span-1"
            src={logoPolkadot}
            alt="polkadot"
            width={198}
            height={70}
          />
          <motion.img
            whileHover={{ scale: 1.1 }}
            className="col-span-2 max-h-20  w-full object-contain lg:col-span-1"
            src={logoYoutube}
            alt="youtube"
            width={158}
            height={60}
          />
          <motion.img
            whileHover={{ scale: 1.1 }}
            className="col-span-2 max-h-20 w-full object-contain lg:col-span-1"
            src={logoMicrosoft}
            alt="microsoft"
            width={158}
            height={48}
          />

          <motion.img
            whileHover={{ scale: 1.1 }}
            className="col-span-2 lg:ml-32 max-h-20 w-full object-contain lg:col-span-1"
            src={logoMedium}
            alt="medium"
            width={158}
            height={48}
          />
          <motion.img
            whileHover={{ scale: 1.1 }}
            className="col-span-2 lg:ml-32 max-h-10 w-full object-contain lg:col-span-1"
            src={logoZoom}
            alt="zoom"
            width={158}
            height={48}
          />
          <motion.img
            whileHover={{ scale: 1.1 }}
            className="col-span-2 lg:ml-32 max-h-10 w-full object-contain lg:col-span-1"
            src={logoUber}
            alt="uber"
            width={158}
            height={48}
          />
          <motion.img
            whileHover={{ scale: 1.1 }}
            className="col-span-2 lg:ml-32 max-h-10 w-full object-contain lg:col-span-1"
            src={logoGrab}
            alt="grab"
            width={158}
            height={48}
          />
        </div>
      </div>
    </div>
  );
};

export default BrandShowcase;
