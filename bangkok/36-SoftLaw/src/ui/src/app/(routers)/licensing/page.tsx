"use client";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/Loading";

const NavBar = dynamic(() => import("@/components/NavBar"), {
  ssr: false,
});

const Licensing = dynamic(
  () => import("@/components/Dashboard/Manage/License"),
  { ssr: false }
);

export default function LicensePage() {
  return (
    <div>
      <NavBar />
      <Suspense
        fallback={
          <div className="bg-[#1C1A11] w-full h-screen flex items-center justify-center">
            <Loading />
          </div>
        }
      >
        <Licensing />
      </Suspense>
    </div>
  );
}
