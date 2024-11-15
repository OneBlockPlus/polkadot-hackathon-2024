"use client";
import React from "react";

interface VariousTypesButtonProps {
  img?: string;
  width?: string;
  text?: string;
  detail?: string;
  className?: string;
  altText?: string;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;  
  isActive: boolean;
}

const VariousTypesButton: React.FC<VariousTypesButtonProps> = ({
  img,
  width,
  text,
  detail,
  className,
  altText,
  onClick,
  isActive,
}) => {

  const getButtonClasses = (isActive: boolean) => {
    if (isActive) {
      return "border-[#FACC15] bg-[#373737]";
    } else {
      return "border-[#8A8A8A]";
    }
  };

  const getHoverClasses = (isActive: boolean) => {
    if (isActive) {
      return "hover:border-[#FACC15] hover:bg-[#373737]";
    } else {
      return "";
    }
  };



  return (
    <div
    className={`w-full flex p-4 min-[2000px]:p-[20px] flex-col border gap-[8px] min-[2000px]:gap-[20px] rounded-[8px] items-start self-stretch ${width} ${className} ${getButtonClasses(isActive)} ${getHoverClasses(isActive)}`}
    onClick={onClick}
    >
      <img src={img} alt={altText} />
      <h1 className="self-stretch font-Montserrat min-[2000px]:text-4xl text-[28px] font-[500] leading-[32px] tracking-[-0.56px]">
        {text}
      </h1>
      <p className="font-Montserrat min-[2000px]:text-3xl min-[2000px]:tracking-[1.5px] text-[16px] font-normal leading-[145%] tracking-[0.32px]">
        {detail}
      </p>
    </div>
  );
};

export default VariousTypesButton;
