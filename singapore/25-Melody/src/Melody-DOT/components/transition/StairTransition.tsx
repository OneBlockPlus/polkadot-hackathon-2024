"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

//components
import Stairs from "./Stairs";

const StairTransition = () => {
  const pathName = usePathname();
  return (
    <>
      <AnimatePresence mode="wait">
        <div key={pathName}>
          <div className="h-screen w-screen fixed top-0 left-0 right-0  z-40 flex pointer-events-none">
            <Stairs />
          </div>
          <motion.div
            className="h-screen w-screen fixed bg-primary top-0 pointer-events-none "
            initial={{ opacity: 1 }}
            animate={{
              opacity: 0,
              transition: {
                opacity: 0,
                transition: { delay: 1, duration: 0.4, ease: "easeInOut" },
              },
            }}
          ></motion.div>
        </div>
      </AnimatePresence>
    </>
  );
};

export default StairTransition;
