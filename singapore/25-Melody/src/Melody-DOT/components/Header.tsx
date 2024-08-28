import Link from "next/link";
//components
import Nav from "./Nav";
import MobilNav from "./MobilNav";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const Header = () => {
  return (
    <header className="h-20 xl:h-16 text-white container mx-auto flex justify-between otems-center">
      {/* logo */}
      <Link href="/">
        <h1 className="text-4xl font-semibold">
          Melody-DOT <span className="text-accent">.</span>
        </h1>
      </Link>
      {/* nav */}
      <div className="hidden lg:flex items-center gap-8">
        <Nav />
        {/* RAINBOW */}
        <ConnectButton />
      </div>

      {/* mobile nav */}
      <div className="lg:hidden ">
        <MobilNav />
      </div>
    </header>
  );
};

export default Header;
