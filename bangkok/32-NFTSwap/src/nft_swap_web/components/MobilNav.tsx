/*
 * @Descripttion:
 * @version: 1.0
 * @Author: Hesin
 * @Date: 2024-08-21 15:48:55
 * @LastEditors: Hesin
 * @LastEditTime: 2024-10-01 14:34:16
 */
"use client";

import React from "react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet-box";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { CiMenuFries } from "react-icons/ci";
//routeList
import { routeList } from "./RouteList";

const MobilNav = () => {
  const pathName = usePathname();

  return (
    <Sheet>
      <SheetTrigger className="flex justify-center items-center">
        <CiMenuFries className="text-[32px] text-white" />
      </SheetTrigger>

      <SheetContent className="flex flex-col">
        {/* logo */}
        <div className="mt-32 mb-40 text-center text-2xl">
          <h2 className="text-4xl font-semibold">
            {/* NFT-Swap <span className="text-purple-200">.</span> */}
          </h2>
        </div>

        {/* nav */}
        <nav className="flex flex-col justify-center items-center gap-8">
          {routeList.map((link, idx) => (
            <Link
              href={link.path}
              key={idx}
              className={`text-xl capitalize hover:text-purple-200 transition-all ${
                link.path === pathName && "text-purple-200 border-b-2 border-accent"
              } capitalize  `}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobilNav;
