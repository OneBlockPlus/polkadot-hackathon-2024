import MobilNav from "@/components/MobilNav";
import Nav from "@/components/Nav";
import Link from "next/link";

// import ConnectButton from "@/components/ConnectButton";
import dynamic from "next/dynamic";

const ConnectButton = dynamic(() => import("@/components/ConnectButton"), {
  ssr: false,
});
const Header = () => {
  return (
    <div className="border-b-2 pt-4 h-20 xl:h-16 text-white container mx-auto flex justify-between otems-center">
      {/* logo */}
      <Link href="/">
        <h1 className="text-4xl font-semibold">
          NFT-Swap <span className="text-white">.</span>
        </h1>
      </Link>
      {/* Nav */}
      <div className="z-50 hidden lg:flex items-center gap-8">
        <Nav />
        {/* RAINBOW */}
        <ConnectButton />
      </div>
      {/* mobile nav */}
      <div className="lg:hidden ">
        <MobilNav />
      </div>
    </div>
  );
};
export default Header;
