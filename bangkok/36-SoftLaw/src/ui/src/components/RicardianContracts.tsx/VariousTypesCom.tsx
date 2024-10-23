"use client";
import React from "react";

interface VariousTypesProps {
  img?: string;
  width?: string;
  text?: string;
  detail?: string;
  className?: string;
  altText?: string;
}

const VariousTypes: React.FC<VariousTypesProps> = ({
  img,
  width,
  text,
  detail,
  className,
  altText,
}) => {
  return (
  
      <div
        className={`w-full flex p-4 flex-col border gap-[8px] rounded-[8px] items-start self-stretch ${width} ${className}`}
      >
        <img src={img} alt={altText} />
        <h1 className="self-stretch font-Montesarrat text-[#D0DFE4] text-[28px] font-[500] leading-[32px] tracking-[-0.56px]">
          {text}
        </h1>
        <p className="font-Montesarrat text-[16px] text-[#D0DFE4] font-normal leading-[145%] tracking-[0.32px]">
          {detail}
        </p>
      </div>
 
  
  );
};

export default VariousTypes;
