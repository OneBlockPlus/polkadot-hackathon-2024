'use client';
import React from "react";

interface TypesProps {
    text: React.ReactNode;
    className?: string;  // Optional prop
    detail?: string;
    isActive?: boolean;
    onClick?: () => void;
}
const TypesComponent: React.FC<TypesProps> = ({text, className, detail, isActive, onClick}) => {
    return (
        <>
        <div className="flex items-center text-center justify-between gap-[8px]">
        <h1 className={`font-Montesarrat text-[16px] font-normal leading-[145%] tracking-[0.32px] min-[2000px]:text-3xl min-[2000px]:tracking-[1px] ${className} ${isActive ? "border-[#FACC15] bg-[#373737]" : ""}`} onClick={onClick}>
        {text} <span className="text-[#8A8A8A]">{detail}</span>
        </h1>
    
        </div>
       
        </>
    )
}

export default TypesComponent