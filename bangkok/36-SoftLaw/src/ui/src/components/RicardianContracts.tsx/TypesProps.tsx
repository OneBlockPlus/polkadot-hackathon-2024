"use client";
import React from "react";

interface TypesProps {
  text: React.ReactNode;
  className?: string; // Optional prop
  detail?: string;
  isActive?: boolean;
  onClick?: () => void;
}
const TypesComponent: React.FC<TypesProps> = ({
  text,
  className,
  isActive,
  onClick,
}) => {
  return (
    <>
      <h1
        className={`font-Montesarrat text-[16px] font-normal leading-[145%] tracking-[0.32px] min-[2000px]:text-3xl min-[2000px]:tracking-[1px] ${className} ${
          isActive ? "border-[#FACC15] bg-[#373737]" : ""
        }`}
        onClick={onClick}
      >
        {text}
      </h1>
    </>
  );
};

export default TypesComponent;
