"use client";

import { ReactNode } from "react"
import { HomeHeader } from "@/app/components/HomeHeader"

function HomeLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <main className="p-4">
        <HomeHeader />
        {children}
    </main>
  )
}

export default HomeLayout