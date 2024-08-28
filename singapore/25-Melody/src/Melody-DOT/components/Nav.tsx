/*
 * @Descripttion:
 * @version: 1.0
 * @Author: Hesin
 * @Date: 2024-08-21 15:28:37
 * @LastEditors: Hesin
 * @LastEditTime: 2024-08-21 15:37:39
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

//routeList
import { routeList } from "./RouteList";

const Nav = () => {
	const pathName = usePathname();

	return (
		<nav className="flex gap-8">
			{routeList.map((link, idx) => (
				<Link
					href={link.path}
					key={idx}
					className={`${
						link.path === pathName && "text-accent border-b-2 border-accent"
					} capitalize font-medium hover:text-accent transition-all`}
				>
					{link.name}
				</Link>
			))}
		</nav>
	);
};

export default Nav;
