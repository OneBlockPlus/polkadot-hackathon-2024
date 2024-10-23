"use client";

import dynamic from "next/dynamic";
const RicardianContracts = dynamic(
  () => import("@/components/RicardianContracts.tsx"),
  {
    ssr: false,
  }
);

export default function Ricardian() {
  return (
    <div className="min-[2000px]:w-[1280px]">
      <RicardianContracts />
    </div>
  );
}
