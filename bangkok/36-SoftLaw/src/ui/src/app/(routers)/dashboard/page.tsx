"use client";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";
import Dash from "../../../components/Dashboard/Dash";

const NavBar = dynamic(() => import("@/components/NavBar"), {
  ssr: false,
});
export default function Ipsearch() {
  return (
    <div className="scrollable bg-[#1C1A11] ">
      <NavBar />
      <Dash />
      {/* <Footer /> */}
    </div>
  );
}
