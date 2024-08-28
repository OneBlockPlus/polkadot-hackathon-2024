import React from 'react';
import { usePolkaContext } from "../../context/PolkaContext";

const VehicleDetail = () => {
  const {carDetails} = usePolkaContext()
    
  return (
    <div className="self-stretch flex flex-col items-start justify-start gap-[20px] z-[2] text-left text-base text-green-900 font-text">
      <div className="self-stretch flex flex-row items-center justify-between text-center text-20xl text-black font-manrope-h3">
        <b>Vehicle Details</b>
      </div>
      <div className="self-stretch flex flex-row flex-wrap items-start justify-start gap-[16px]">
        <div className="w-[280px] flex flex-col items-start justify-center gap-[6px]">
          <div className="flex flex-col items-start justify-start">
            <b className="w-[335px] relative inline-block">License plate</b>
          </div>
          <div className="self-stretch rounded-xl flex flex-row items-start justify-start text-black">
            <div className="flex-1 relative inline-block h-6">
              {carDetails.license}
            </div>
          </div>
        </div>
        <div className="w-[280px] flex flex-col items-start justify-center gap-[6px]">
          <div className="flex flex-col items-start justify-start">
            <b className="w-[335px] relative inline-block">Country</b>
          </div>
          <div className="self-stretch rounded-xl flex flex-row items-start justify-start text-black">
            <div className="flex-1 relative inline-block h-6">
              {carDetails.country}
            </div>
          </div>
        </div>
        <div className="w-[280px] flex flex-col items-start justify-center gap-[6px]">
          <div className="flex flex-col items-start justify-start">
            <b className="w-[335px] relative inline-block">Make</b>
          </div>
          <div className="self-stretch rounded-xl flex flex-row items-start justify-start text-black">
            <div className="flex-1 relative inline-block h-6">
              {carDetails.make}
            </div>
          </div>
        </div>
        <div className="w-[280px] flex flex-col items-start justify-center gap-[6px]">
          <div className="flex flex-col items-start justify-start">
            <b className="w-[335px] relative inline-block">Model</b>
          </div>
          <div className="self-stretch rounded-xl flex flex-row items-start justify-start text-black">
            <div className="flex-1 relative inline-block h-6">
              {carDetails.model}
            </div>
          </div>
        </div>
        <div className="w-[280px] flex flex-col items-start justify-center gap-[6px]">
          <div className="flex flex-col items-start justify-start">
            <b className="w-[335px] relative inline-block">Odometer Mileage</b>
          </div>
          <div className="self-stretch rounded-xl flex flex-row items-start justify-start text-black">
            <div className="flex-1 relative inline-block h-6">
              {carDetails.mileage}
            </div>
          </div>
        </div>
        <div className="w-[280px] flex flex-col items-start justify-center gap-[6px]">
          <div className="flex flex-col items-start justify-start">
            <b className="w-[335px] relative inline-block">Style</b>
          </div>
          <div className="self-stretch rounded-xl flex flex-row items-start justify-start text-black">
            <div className="flex-1 relative inline-block h-6">
              {carDetails.exterior}
            </div>
          </div>
        </div>
        <div className="w-[280px] flex flex-col items-start justify-center gap-[6px]">
          <div className="flex flex-col items-start justify-start">
            <b className="w-[335px] relative inline-block">Exterior Color</b>
          </div>
          <div className="self-stretch rounded-xl flex flex-row items-start justify-start text-black">
            <div className="flex-1 relative inline-block h-6">
              {carDetails.exterior}
            </div>
          </div>
        </div>
        <div className="w-[280px] flex flex-col items-start justify-center gap-[6px]">
          <div className="flex flex-col items-start justify-start">
            <b className="w-[335px] relative inline-block">Interior Color</b>
          </div>
          <div className="self-stretch rounded-xl flex flex-row items-start justify-start text-black">
            <div className="flex-1 relative inline-block h-6 mb-10">
              {carDetails.interior}
            </div>
          </div>
        </div>
      </div>

      <div className="self-stretch relative box-border h-px border-t-[1px] border-solid border-green-200" />
      <div className="self-stretch flex flex-col items-start justify-start">
        <div className="self-stretch flex flex-col items-start justify-start">
          <div className="self-stretch flex lg:flex-row flex-col items-start justify-start gap-[20px]">
            <div className="self-stretch w-[280px] flex flex-col items-start justify-start gap-[6px] min-w-[280px]">
              <div className="self-stretch flex flex-col items-start justify-start">
                <b className="self-stretch relative">Currency</b>
              </div>
              <div className="self-stretch flex-1 rounded-xl bg-white-10 flex flex-row items-center justify-start py-3 pr-6 pl-3 text-black">
                <div className="flex-1 relative inline-block h-6">
                  {carDetails.token}
                </div>
              </div>
            </div>
            <div className="flex-1 flex flex-col items-start justify-start gap-[6px]">
              <div className="flex flex-col items-start justify-start">
                <b className="w-[335px] relative inline-block">Asking Price</b>
              </div>
              <div className="self-stretch rounded-xl bg-green-10 flex flex-row items-center justify-start p-3 gap-[12px] text-6xl font-manrope-h3">
                <img
                  className="w-6 relative rounded-[39px] h-6 overflow-hidden shrink-0"
                  alt=""
                  src="/images/kusama.png"
                />
                <div className="flex-1 relative font-semibold">
                  {carDetails.price}
                </div>
                {/* <div className="relative text-base font-text">( ~ $3,890)</div> */}
              </div>
            </div>
            <div className="self-stretch w-[280px] flex flex-col items-start justify-start gap-[6px] min-w-[280px]">
              <div className="flex flex-col items-start justify-start">
                <b className="self-stretch relative">Listing Duration</b>
              </div>
              <div className="self-stretch flex-1 rounded-xl bg-white-10 flex flex-row items-center justify-start py-3 pr-6 pl-3 text-black">
                <div className="flex-1 relative inline-block h-6">
                  {carDetails.duration}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;
