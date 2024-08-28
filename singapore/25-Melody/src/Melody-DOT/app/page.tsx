/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: Hesin
 * @Date: 2024-08-27 15:33:06
 * @LastEditors: Hesin
 * @LastEditTime: 2024-08-27 20:40:55
 */
"use client";

import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { PlayerProvider, PlayGround } from "@/components/player";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardStack, Highlight } from "@/components/ui/card-stack";
import { Cover } from "@/components/ui/cover";

export default function Home() {
  return (
    <main className="w-full overflow-auto relative">
      {/* TITLE */}
      <BackgroundBeamsWithCollision>
        <h1
          className="my-20 text-center text-4xl md:text-4xl lg:text-6xl font-semibold"
          style={{ lineHeight: "5rem" }}
        >
          Build stunning NFT and music experiences <br /> at &nbsp;
          <Cover>lightning speed</Cover>
        </h1>
      </BackgroundBeamsWithCollision>
		</main>
	);
}
