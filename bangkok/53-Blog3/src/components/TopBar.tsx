'use client';

import Link from "next/link";
import SignIn from "@/components/connect/Connect";
import Image from 'next/image';
import {
    Divider,
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    NavbarMenu,
    NavbarMenuItem,
    NavbarMenuToggle,
} from '@nextui-org/react';
import {usePathname} from 'next/navigation';
import {useEffect, useState} from "react";
import {cls} from "@/libs/helper";

export interface NavItem {
    name: string
    path: string
}

export interface NavIcon {
    name: string
    img: string
    href: string
}

export const NavItems: NavItem[] = [
    {name: 'Home', path: '/'},
    {name: 'User', path: '/user'},
    {name: 'Article', path: '/article'},
    {name: 'Follow', path: '/follow'},
    {name: 'Pay', path: '/pay'},
]

export const NavIcons: NavIcon[] = [
    {name: 'X', img: '/X.svg', href: 'https://x.com/'},
    {
        name: 'Discord',
        img: '/discord.svg',
        href: 'https://discord.gg/',
    },
]

export function TopBar() {
    const pathname = usePathname()
    const [hasMounted, setHasMounted] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    useEffect(() => {
        setHasMounted(true)
    }, [])

// Delay render of ShowAccount to avoid "Text content did not match." warning
    if (!hasMounted) {
        return null
    }

    return (
        <>

            <Navbar
                maxWidth="lg"
                onMenuOpenChange={setIsMenuOpen}
                isBlurred
                className="bg-transparent"
            >
                <NavbarMenuToggle
                    as="div"
                    aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                    className="lg:hidden cursor-pointer"
                />
                <NavbarBrand>
                    <Image
                        className="rounded-full"
                        src="/logo.svg"
                        width="42"
                        height="42"
                        alt="logo"
                    />
                    <p className="ml-[0.5rem] font-medium text-white/90">Blog3</p>
                </NavbarBrand>

                <NavbarContent
                    className="gap-10 hidden lg:flex lg:ml-[15rem] 2xl:ml-[36rem] text-white/90"
                    justify="center"
                >
                    {NavItems.map(item => {
                        return (
                            <NavbarItem isActive={pathname === item.path} key={item.name}>
                                <Link color="foreground" href={item.path}>
                                    {item.name}
                                </Link>
                            </NavbarItem>
                        )
                    })}
                </NavbarContent>

                <NavbarContent justify="end" className="ml-4">
                    {NavIcons.map((item, index) => (
                        <NavbarItem
                            key={item.name}
                            className={cls([
                                'shrink-0 hidden md:flex',
                                index === 0 && ' ml-[3rem]',
                            ])}
                        >
                            <Link href={item.href} target="_blank">
                                <Image src={item.img} alt={item.name} width="20" height="20"/>
                            </Link>
                        </NavbarItem>
                    ))}

                    <NavbarItem>
                        <SignIn/>
                    </NavbarItem>
                </NavbarContent>

                <NavbarMenu>
                    {NavItems.map((item, index) => (
                        <NavbarMenuItem key={index}>
                            <Link
                                color="foreground"
                                className="block w-full py-4 font-medium text-lg text-white/90"
                                href={item.path}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.name}
                            </Link>
                        </NavbarMenuItem>
                    ))}
                    {NavIcons.map((item, index) => (
                        <NavbarMenuItem key={index}>
                            <Link
                                color="foreground"
                                className="block w-full py-4 font-medium text-lg text-white/90"
                                href={item.href}
                                target="_blank"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.name}
                            </Link>
                        </NavbarMenuItem>
                    ))}
                </NavbarMenu>
            </Navbar>
            <Divider className="my-4"/>
        </>
    )
}

export default TopBar;
