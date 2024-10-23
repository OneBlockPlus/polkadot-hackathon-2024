"use client";
import React, { useState } from "react";

interface VariousTypesSelectProps {
  types: Array<{
    value: string;
    name: string;
    description: string;
    prefix: string;
    image: string;
  }>;
  className?: string;
  onChange?: (value: string) => void;
}

const VariousTypesSelect: React.FC<VariousTypesSelectProps> = ({ types, className, onChange }) => {
  const [selectedType, setSelectedType] = useState<string>(types[0].value);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    setSelectedType(selectedValue);

    if (onChange) {
      onChange(selectedValue);
    }
  };

  const selectedTypeInfo = types.find((type) => type.value === selectedType);

  return (
    <div className={`w-full flex flex-col ${className}`}>
      <select
        onChange={handleSelectChange}
        value={selectedType}
        className="p-2 border rounded-[8px] bg-[#1C1A11] text-[#D0DFE4] border-[#FACC15]"
      >
        {types.map((type) => (
          <option key={type.value} value={type.value} className="text-black">
            {type.name}
          </option>
        ))}
      </select>

      {selectedTypeInfo && (
        <div className="mt-4 flex flex-col items-start">
          <img src={selectedTypeInfo.image} alt={selectedTypeInfo.name} className="w-full rounded-[8px]" />
          <h1 className="font-Montserrat text-[#D0DFE4] text-[28px] font-[500] leading-[32px] mt-4">
            {selectedTypeInfo.name}
          </h1>
          <p className="font-Montserrat text-[16px] text-[#D0DFE4] font-normal leading-[145%] mt-2">
            {selectedTypeInfo.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default VariousTypesSelect;
