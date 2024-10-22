"use client";
 

import React from "react";
import Hero from "./hero";
import Features from "./features";
import GetStarted from "./get-started";
import Footer from "./footer";



export default function HomePage() {
  return (
    <div className="w-full ">
   
     <Hero  />
     <Features  />
     <GetStarted  />
     <Footer  />
    


    </div>
  )
}
