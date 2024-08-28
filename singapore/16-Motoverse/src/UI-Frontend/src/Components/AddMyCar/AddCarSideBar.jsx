import React from 'react';
import { usePolkaContext } from '../../context/PolkaContext';

const AddCarSideBar = () => {

  const { setSelectedTabAddmycar} = usePolkaContext();

  const handleTabVehicleInfo = async () => {
    setSelectedTabAddmycar(0);
  }

  const handleTabUploadEvidence = async () => {
    setSelectedTabAddmycar(1);
  }
  const handleTabGeneralInfo = async () => {
    setSelectedTabAddmycar(2);
  }
  const handleTabMint= async () => {
    setSelectedTabAddmycar(3);
  }


  return (
    <div className="w-full lg:w-[400px] fixed-width-sidebar rounded-xl bg-green-100 flex flex-col items-start justify-start p-4 box-border gap-[40px]">
      <div className="self-stretch flex flex-col items-start justify-start gap-[20px]">
        <b className="self-stretch relative leading-[120%] text-3xl">
          Add my Car to
          <div>Motoverse MarketPlace</div>
        </b>

        <div className="self-stretch relative text-base font-text">
          Follow these steps to apply for an account and car's information on
          Mogoverse Marketplace.
        </div>
      </div>
      <div className="self-stretch flex flex-col items-start justify-start text-base text-white-10 font-text">
        <div className="flex flex-row items-center justify-start gap-[12px]">
          <div
            className="w-10 h-10 rounded-51xl hover:bg-blue-700 bg-green-200  flex flex-col items-center justify-center p-3 box-border cursor-pointer"
            onClick={handleTabVehicleInfo}
          >
            <div className="relative">1</div>
          </div>
          <div className="flex-1 relative text-green-900">
            Vehicle Information
          </div>
        </div>
        <div className="self-stretch h-5 flex flex-row items-start justify-start py-1 px-5 box-border">
          <div className="self-stretch w-px relative box-border border-r-[1px] border-solid border-green-200" />
        </div>
        <div className="flex flex-row items-center justify-start gap-[12px]">
          <div
            className="w-10 rounded-51xl bg-green-200 hover:bg-blue-700 h-10 flex flex-col items-center justify-center p-3 box-border cursor-pointer"
            onClick={handleTabUploadEvidence}
          >
            <div className="relative">2</div>
          </div>
          <div className="flex-1 relative text-green-900">Upload Evidence</div>
        </div>
        <div className="w-10 h-5 flex flex-row items-center justify-center py-1 px-0 box-border">
          <div className="self-stretch w-px relative box-border border-r-[1px] border-solid border-green-200" />
        </div>
        <div className="flex flex-row items-center justify-start gap-[12px] text-bg">
          <div
            className="w-10 rounded-51xl bg-green-200 hover:bg-blue-700 h-10 flex flex-col items-center justify-center p-3 box-border cursor-pointer"
            onClick={handleTabGeneralInfo}
          >
            <div className="relative">3</div>
          </div>
          <div className="flex-1 relative text-green-900">
            Owner Information
          </div>
        </div>
        <div className="w-10 h-5 flex flex-row items-center justify-center py-1 px-0 box-border">
          <div className="self-stretch w-px relative box-border border-r-[1px] border-solid border-green-200" />
        </div>
        <div className="flex flex-row items-center justify-start gap-[12px]">
          <div
            className="w-10 rounded-51xl bg-green-200 hover:bg-blue-700 h-10 flex flex-col items-center justify-center p-3 box-border cursor-pointer"
            onClick={handleTabMint}
          >
            <div className="relative">4</div>
          </div>
          <div className="flex-1 relative text-green-900">
            Mint NFT
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCarSideBar;
