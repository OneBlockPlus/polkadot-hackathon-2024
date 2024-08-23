import React from "react";
import { motion } from "framer-motion";

import cta from "../../assets/cta.png";

const CreateEventSection = () => {
  return (
    <div className="bg-purple-100 lg:relative flex items-center lg:h-[232px]  justify-center py-10 px-4">
      <div className="lg:absolute left-[300px] -top-8 hidden lg:block">
        <motion.img
          whileHover={{ scale: 1.1, transition: { duration: 0.5 } }}
          src={cta}
          alt="Create Event Illustration"
          className="lg:h-[263px] lg:w-[544px] h-48"
        />
      </div>
      <div className="flex-auto lg:absolute right-96 top-6">
        <h2 className="text-4xl font-bold text-start text-gray-800 mb-3">
          Make your own Event
        </h2>
        <p className="mb-6 text-start w-[382px] ">
          Got an idea for an event? Start your journey with us and create an
          unforgettable experience!
        </p>
        <motion.button
          whileHover={{
            scale: 1.1,
          }}
          className="text-white bg-[#F5167E] lg:w-[302px] lg:h-[60px] hover:bg-pink-600 font-bold py-2 px-4 rounded-full shadow-2xl transition duration-300"
        >
          Create Events
        </motion.button>
      </div>
    </div>
  );
};

export default CreateEventSection;
