import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@nextui-org/navbar";
import { Button } from "@nextui-org/button";
import { Kbd } from "@nextui-org/kbd";
import { Link } from "@nextui-org/link";
import { Input } from "@nextui-org/input";
import { link as linkStyles } from "@nextui-org/theme";
import NextLink from "next/link";
import clsx from "clsx";
import { title, subtitle } from "@/components/primitives";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import {
  TwitterIcon,
  GithubIcon,
  DiscordIcon,
  HeartFilledIcon,
  SearchIcon,
  Logo,
} from "@/components/icons";

export const Navbar = () => {
  const searchInput = (
    <Input
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["command"]}>
          K
        </Kbd>
      }
      labelPlacement="outside"
      placeholder="Search..."
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  );

  return (
    <NextUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full mt-2" justify="end">
        <NavbarItem className="hidden sm:flex gap-2">
          <div className="font-mono font-extrabold text-3xl italic">
            DOTCIRCLES
          </div>
        </NavbarItem>
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <div className="logo-container">
              <div className="circle white-circle">
                <div className="dark-orbit"></div>
              </div>
              <div className="circle black-circle">
                <div className="light-orbit"></div>
              </div>
            </div>
          </NextLink>
        </NavbarBrand>
        <NavbarItem className="hidden sm:flex gap-2">
          <div className="font-mono font-extrabold text-3xl italic">
            DOTCIRCLES
          </div>
        </NavbarItem>
      </NavbarContent>
    </NextUINavbar>
  );
};
