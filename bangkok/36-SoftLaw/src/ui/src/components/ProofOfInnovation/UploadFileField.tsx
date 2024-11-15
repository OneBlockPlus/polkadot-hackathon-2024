
'use client';
import React, { useRef } from "react";
import TypesComponent from "../TypesProps";
import UploadMultipleFilesToIPFS from "../UploadFiles";

interface UploadFilesFieldPrompts {
  text: React.ReactNode;
  files: string;
  fileType: React.ReactNode;
  onFileUpload: (file: File) => void; // handle file upload
}

const UploadFilesField: React.FC<UploadFilesFieldPrompts> = ({ text, files, fileType, onFileUpload }) => {
  // Create a reference for the hidden input
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Function to trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click(); // Programmatically trigger click
  };

  // Function to handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // Get the first file selected
    if (file) {
      onFileUpload(file); // Call the parent handler to update form state
    }
  };

  return (
    <div className="flex flex-col items-start gap-[16px]">
      <TypesComponent className="text-[#FFF]" text={text} />

      <div className="flex flex-col w-full py-[60px] px-[16px] justify-center gap-[16px] items-center bg-[#27251C] rounded-[16px] min-[2000px]:text-2xl min-[2000px]:w-5/6">
        
       
        <UploadMultipleFilesToIPFS className="gap-[20px] space-y-4" />

        {/* Hidden input for upload */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange} // Trigger when file is uploaded
          className="hidden"
          accept=".doc,.pdf" // File types allowed
        />

        <TypesComponent className="text-[#8A8A8A] block" 
        text={
          <>
            You may change this after deploying your contract.<br /> 
            <span className="text-center flex items-start justify-center">{fileType}</span> {/* Wrapped in span to allow flexible line break */}
          </>
        } 
        />
      </div>
    </div>
  );
};

export default UploadFilesField;
