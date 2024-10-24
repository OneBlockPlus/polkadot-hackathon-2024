import Image from "next/image";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import TestComp from "@/components/test-comp";
import HomePage from "@/components/home/Home-page";
export default function Home() {
  return (
    <div className=" font-[family-name:var(--font-geist-sans)]">
      <HomePage  />
    </div>
  );
}
