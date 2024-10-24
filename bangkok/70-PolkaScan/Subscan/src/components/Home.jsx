import React from 'react';
import { motion } from 'framer-motion';

const Home = () => {

  const logos = [
    {
      src: "https://cryptologos.cc/logos/polkadot-new-dot-logo.svg?v=024",
      alt: "Polkadot Logo",
    },
    {
      src: "https://cryptologos.cc/logos/astar-astr-logo.svg?v=024",
      alt: "Astar Logo",
    },
    {
      src: "https://cryptologos.cc/logos/moonbeam-glmr-logo.svg?v=024",
      alt: "Moonbeam Logo",
    },
    {
      src: "https://cryptologos.cc/logos/kusama-ksm-logo.svg?v=024",
      alt: "Kusama Logo",
    },
    {
      src: "https://cdn.prod.website-files.com/66475ee97bcbe587a63b28c9/6699032a94bb4eeb967a25ea_peaq-opengraph.webp",
      alt: "Peaq Logo",
    },
  ];

  // Utility to generate random movement for logos
  const generateRandomMovement = () => {
    const x = Math.random() * 200 - 100; // Random value between -100 and 100
    const y = Math.random() * 200 - 100;
    const rotate = Math.random() * 360;
    return { x, y, rotate };
  };


  return (
    <section className="pt-0 pb-20 md:pb-10 bg-gradient-to-b from-white via-pink-200 to-pink-300 overflow-x-clip h-screen w-screen"> 
      <div className="container mx-auto px-4">
        <div className="md:flex items-center justify-between">
          
          {/* Left Section - Text and Buttons */}
          <div className="md:w-[478px]">
            <div className="tag text-black mt-[100px]">Version 1.0 is here</div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter bg-gradient-to-b from-pink-500 via-pink-400 to-pink-400 text-transparent bg-clip-text mt-6">
             Polkadot ecosystem tracker
            </h1>
            <p className="text-xl text-black tracking-tight mt-6">
              Simplifying the tracking
            </p>
            <div className="flex gap-3 items-center mt-[30px]">
              <a href="">
                <button className="btn btn-primary px-5 py-3 bg-black text-white rounded-md">Get Started</button>
              </a>
              <button className="btn btn-text gap-1 px-5 py-3 bg-transparent text-black border-black border rounded-md">
                <span>Learn more</span>
                <svg
                  className="h-5 w-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  ></path>
                </svg>
              </button>
            </div>

            {/* Floating Logos */}
            <div className="relative mt-10">
              <motion.div
                className="flex gap-10"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                  repeat: Infinity,
                  repeatType: 'loop',
                  duration: 12,  // Adjust speed here
                  ease: 'linear'
                }}
              >
                <img
                  src="https://cryptologos.cc/logos/polkadot-new-dot-logo.svg?v=024"
                  alt="Polkadot Logo"
                  className="h-12 w-auto"
                />
                <img
                  src="https://cryptologos.cc/logos/astar-astr-logo.svg?v=024"
                  alt="Astar Logo"
                  className="h-12 w-auto"
                />
                <img
                  src="https://cryptologos.cc/logos/moonbeam-glmr-logo.svg?v=024"
                  alt="Moonbeam Logo"
                  className="h-12 w-auto"
                />
                <img
                  src="https://cryptologos.cc/logos/kusama-ksm-logo.svg?v=024"
                  alt="Kusama Logo"
                  className="h-12 w-auto"
                />
                 <img
                  src="https://cdn.prod.website-files.com/66475ee97bcbe587a63b28c9/6699032a94bb4eeb967a25ea_peaq-opengraph.webp"
                  alt="Peaq Logo"
                  className="h-12 w-42 "
                />
              </motion.div>
            </div>
          </div>

          {/* Right Section - Animated Image */}
          <motion.div
            className="md:w-[478px] md:mt-[30px]"
            initial={{ x: 300, opacity: 0 }}  // Start off-screen to the right
            animate={{ x: 0, opacity: 1 }}    // Slide in from the right
            transition={{ delay: 1.2, duration: 0.8, ease: 'easeOut' }} // 2-second delay for initial animation
          >
            {/* Infinite Y-axis up and down movement */}
            <motion.img
    src="https://cryptologos.cc/logos/polkadot-new-dot-logo.svg?v=024"
    alt="Aligned Layer Image"
    className="rounded-lg shadow-md h-[200px] bg-transparent"
    animate={{ 
      y: [-10, 10, -10], // Moves 10px up and down
      rotate: [0, 360],  // Spins 360 degrees
    }}
    transition={{ 
      repeat: Infinity,               // Infinite loop
      duration: 5,                    // Duration for the full loop
      ease: 'easeInOut',              // Smooth easing
    }}
  />
          </motion.div>

        </div>
        
      </div>
    </section>
  );
};

export default Home;
