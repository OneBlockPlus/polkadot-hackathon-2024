/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: Hesin
 * @Date: 2024-09-30 18:37:10
 * @LastEditors: Hesin
 * @LastEditTime: 2024-09-30 23:03:15
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

//routeList
import { routeList } from "./RouteList";

const Nav = () => {
  const pathName = usePathname();

  return (
    <nav className="flex gap-8 ">
      {routeList.map((link, idx) => (
        <Link
          href={link.path}
          key={idx}
          className={`${
            link.path === pathName && "text-purple-200 border-b-2 border-purple-200"
          } capitalize font-medium hover:text-purple-200 hover:border-purple-200 transition-all`}
        >
          {link.name}
        </Link>
      ))}
    </nav>
  );
};

export default Nav;
