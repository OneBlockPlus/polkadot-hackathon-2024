"use client";
import React, { useState } from "react";
// import MaxWidthWrapper from "@/components/MaxWidhWrapper";



// Define an interface for the props
interface CardServicesProps {
  imageUrl: string;
  altText: string;
  title: React.ReactNode; //title is of type React.ReactNode, which allows for JSX (like the <br /> tag).
  boxShadow: string;
}


const CardServices: React.FC<CardServicesProps> = ({ imageUrl, altText, title, boxShadow }) => {
  return (
    <div className="flex flex-col min-[2000px]:w-[500px] min-[2000px]:h-[500px] w-[350px] h-[350px] py-[0px] gap-[16px] justify-center items-center rounded-[12px] bg-[#1C1A11] transform transition-transform duration-300 hover:scale-105" style={{boxShadow}}>
      
        <img src={imageUrl} alt={altText} className=" min-[2000px]:w-[70px] min-[2000px]:h-[70px]" />
        <h1 className="text-[#D0DFE4] text-center font-Montesarrat text-[20px] min-[2000px]:text-3xl font-normal leading-[32px] tracking-[-0.4px] uppercase">
          {title}
        </h1>
        
      </div>


  );
}

export default CardServices;