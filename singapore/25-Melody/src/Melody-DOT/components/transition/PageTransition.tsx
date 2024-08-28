/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: Hesin
 * @Date: 2024-08-21 15:28:37
 * @LastEditors: Hesin
 * @LastEditTime: 2024-08-21 15:48:15
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

const PageTransition = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const pathName = usePathname();

  return (
    <AnimatePresence>
      <div key={pathName}>
        <motion.div
          initial={{ opacity: 1 }}
          animate={{
            opacity: 0,
            transition: { delay: 1, duration: 0.4, ease: "easeInOut" },
          }}
          className="h-screen w-screen fixed top-0 bg-primary pointer-events-none"
        />
      </div>
      
      {children}
    </AnimatePresence>
  );
};

export default PageTransition;
