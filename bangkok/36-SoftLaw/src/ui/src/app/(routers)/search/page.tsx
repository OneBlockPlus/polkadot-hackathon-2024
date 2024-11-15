"use client";
import dynamic from "next/dynamic";
const IPSearch = dynamic(() => import("@/components/search/IPSearch"), {
  ssr: false,
});
const NavBar = dynamic(() => import("@/components/NavBar"), {
  ssr: false,
});
export default function Ipsearch() {
  return (
    <div className="scrollable">
      <NavBar />
      <IPSearch />
    </div>
  );
}
