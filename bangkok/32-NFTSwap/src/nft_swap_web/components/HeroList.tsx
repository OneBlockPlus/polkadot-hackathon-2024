/*
 * @Descripttion:
 * @version: 1.0
 * @Author: Hesin
 * @Date: 2024-10-11 17:01:06
 * @LastEditors: Hesin
 * @LastEditTime: 2024-10-22 10:53:42
 */
"use client";
import Image from "next/image";
import React from "react";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";

export function HeroList() {
  const cards = data.map((card, index) => (
    <Card key={card.src} card={card} index={index} />
  ));

  return (
    <div className="w-full h-full py-20">
      <Carousel items={cards} />
    </div>
  );
}

const DummyContent = () => {
  return (
    <>
      {[...new Array(3).fill(1)].map((_, index) => {
        return (
          <div
            key={"dummy-content" + index}
            className="bg-violet-200 dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4"
          > 
            <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
              <span className="font-bold text-neutral-700 dark:text-neutral-200">
                The first rule of Apple club is that you boast about Apple club.
              </span>{" "}
              Keep a journal, quickly jot down a grocery list, and take amazing
              class notes. Want to convert those notes to text? No problem.
              Langotiya jeetu ka mara hua yaar is ready to capture every
              thought.
            </p>
            {/* <Image
              src="https://assets.aceternity.com/macbook.png"
              alt="Macbook mockup from Aceternity UI"
              height="500"
              width="500"
              className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain"
            /> */}
          </div>
        );
      })}
    </>
  );
};

const data = [
  {
    category: "Productivity",
    title: "Enhance your productivity.",
    src: "/images/13cd1b7b.png",
    info: {
      a: "ABC",
      b: "10000 SNS",
      c: "Account2",
    },
  },
  {
    category: "Productivity",
    title: "Enhance your productivity.",
    src: "/images/2a151c7e.png",
    info: {
      a: "ABC",
      b: "10000 SNS",
      c: "Account2",
    },
  },
  {
    category: "Productivity",
    title: "Enhance your productivity.",
    src: "/images/2a403b20.png",
    info: {
      a: "ABC",
      b: "10000 SNS",
      c: "Account3",
    },
  },
  {
    category: "Productivity",
    title: "Enhance your productivity.",
    src: "/images/23d34011.png",
    info: {
      a: "ABC",
      b: "10000 SNS",
      c: "Account4",
    },
  },
];
