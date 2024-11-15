"use client";
import dynamic from "next/dynamic";

const NavBar = dynamic(() => import("@/components/NavBar"), {
  ssr: false,
});

//////////// -- INNOVATION v2 WITH COLLECTION--//////////////////
// const InnovationPage = dynamic(() => import("@/components/innovationV2"), {
//   ssr: false,
// });

const InnovationPage = dynamic(() => import("@/components/innovationV1"), {
  ssr: false,
});

export default function DashPage() {
  return (
    <div className="scrollable bg-[#1C1A11]">
      <NavBar />
      <InnovationPage />
      {/* <Footer /> */}
    </div>
  );
}
