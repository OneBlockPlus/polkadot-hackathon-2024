import React from "react"
import UploadMultipleFilesToIPFS from "./FileUpload";
import ImageGallery from "./ImageGallery";
import { usePolkaContext } from "../../../context/PolkaContext";

const UploadImage = () => {
  const {setSelectedTabAddmycar, imagesLinks} = usePolkaContext()

  const handleNextTab = () => {
    setSelectedTabAddmycar(2);
  };


  return (
    <div className="w-full relative min-h-screen bg-white-50 overflow-hidden text-center text-[27px] text-black font-text">
      <div className="self-stretch flex flex-col lg:flex-row md:flex-col items-start justify-start py-10 px-m lg:px-xl gap-[31px] text-left text-20xl font-manrope-25px-regular mb-6">
        <div className="flex-1 flex flex-col items-start justify-start text-center text-green-900 w-full">
          <div className="self-stretch flex flex-col items-start justify-start pt-0 px-0 pb-m gap-[60px]">
            <div className="self-stretch flex flex-col items-start justify-start gap-[12px]">
              <b className="relative leading-[120%]">Upload Evidence</b>
              <div className="self-stretch flex flex-col items-start justify-start gap-[12px] text-left text-base font-text">
                <div className="self-stretch relative">
                  Adding photos can attract more buyers, leading to a faster,
                  successful sale.
                </div>
                <div className="self-stretch relative">Using 0/30 images</div>
              </div>
            </div>
            <div className="self-stretch rounded-3xl bg-white-10 h-70 flex flex-col items-center justify-center py-l px-3 box-border gap-[10px] text-left text-base font-text w-full">
              <UploadMultipleFilesToIPFS />
              <div className="self-stretch relative text-grey-500 text-center mt-4">
                <p className="m-0">Select Images to Upload</p>
                <p className="mb-4"> From your device</p>
              </div>
            </div>
            <div className="self-stretch ">
              <ImageGallery imageLinks={imagesLinks} />
            </div>
            <button 
              className="rounded-3xl bg-darkslategray py-2 m-4 px-s text-left text-white "
              onClick={handleNextTab}
            >
              Go to Owner Information
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadImage;
