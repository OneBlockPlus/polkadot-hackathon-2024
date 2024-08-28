/*
 * @Descripttion:
 * @version: Chevalier
 * @Author:
 * @Date: 2024-08-21 11:28:37
 * @LastEditors: Chevalier
 * @LastEditTime: 2024-08-21 11:29:26
 */

"use client";

import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { PlayerProvider, PlayGround } from "@/components/player";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardStack, Highlight } from "@/components/ui/card-stack";
import { Cover } from "@/components/ui/cover";

const Gallery = () => {
  return (
    <main className="w-full overflow-auto relative">
      <div className=" flex items-center w-full gap-4 px-20 md:mx-auto mt-6 mb-20">
        <div className=" w-4/5 border-r pr-8">
          <Tabs defaultValue="account" className="w-full">
            <TabsList>
              <TabsTrigger value="account">Music</TabsTrigger>
              <TabsTrigger value="password">News</TabsTrigger>
            </TabsList>
            <TabsContent value="account" >
              <PlayerProvider>
                <PlayGround />
              </PlayerProvider>
            </TabsContent>
            <TabsContent value="password">news</TabsContent>
          </Tabs>
        </div>
        <div className="w-1/5">{/* <CardStack items={CARDS} /> */}</div>
      </div>

      <div className="my-40"></div>
    </main>
  );
};

export default Gallery;
