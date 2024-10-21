"use client";
import {Button, Navbar} from "flowbite-react";
import {ComponentProps} from "react";
import {usePathname} from "next/navigation";
import Link from "next/link";
import {twMerge} from "tailwind-merge";
import Image from "next/image";

export const Header: React.FC<ComponentProps<any>> = ({children}) => {
    const pathname = usePathname();
    const navItems = [
        {
            title: "Home",
            href: "/",
        },
        {
            title: "About",
            href: "/about",
        },
        {
            title: "Contact",
            href: "/contact",
        },
        {
            title: "FAQ",
            href: "/faq",
        },
    ];
    return (
        <Navbar fluid rounded className={"w-full rounded-none py-4"}>
            <Navbar.Brand href="/">
                <Image
                    src="https://s3.ap-southeast-1.amazonaws.com/cdn.thecosmicblock.com/bookadot-icon.png"
                    alt="Bookadot"
                    width={65}
                    height={65}
                />
            </Navbar.Brand>
            {/* <Navbar.Collapse> */}
            <div
                className={
                    "bookadot-header-item invisible flex flex-col justify-between gap-5 md:visible md:flex-row xl:gap-10"
                }
            >
                {navItems.map((navItem, index) => (
                    <Link
                        href={navItem.href}
                        key={index}
                        className={twMerge(
                            "text-white hover:text-accent-color",
                            [navItem.href].includes(pathname) && "text-accent-color",
                        )}
                    >
                        {navItem.title}
                    </Link>
                ))}
            </div>
            {/* </Navbar.Collapse> */}
            <a href={'https://bookadot.thecosmicblock.com/cinema'} target={"_blank"}>
                <Button color={"bookadot-secondary"}>
                    Launch dApp
                </Button>
            </a>
        </Navbar>
    );
};
