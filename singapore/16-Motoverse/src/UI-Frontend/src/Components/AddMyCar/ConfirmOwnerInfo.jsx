import React from "react";
import { usePolkaContext } from "../../context/PolkaContext";

const ConfirmOwnerInfo = () => {
  const {ownerInfo} = usePolkaContext()

  return (
    <div className="self-stretch flex flex-col items-start justify-start gap-[16px] z-[6]">
      <div className="self-stretch flex flex-row items-center justify-between">
        <b className="relative leading-[120%]">Vehicle Owner’s Information</b>
      </div>
      <div className="self-stretch flex flex-col items-start justify-start gap-[23px] text-left text-base text-green-900 font-text">
        <div className="w-[359px] flex flex-col items-start justify-start gap-[6px]">
          <div className="flex flex-col items-start justify-start">
            <b className="w-[335px] relative inline-block">Name</b>
          </div>
          <div className="self-stretch rounded-xl flex flex-row items-start justify-start text-black">
            <div className="flex-1 relative inline-block h-6">{`${ownerInfo.firstName} ${ownerInfo.lastName}`}</div>
          </div>
        </div>
        <div className="self-stretch flex flex-col items-start justify-start gap-[6px]">
          <div className="flex flex-col items-start justify-start">
            <b className="w-[335px] relative inline-block">Address</b>
          </div>
          <div className="self-stretch rounded-xl flex flex-row items-start justify-start text-black">
            <div className="flex-1 relative inline-block h-6">
              {ownerInfo.address}
            </div>
          </div>
        </div>
        <div className="self-stretch flex lg:flex-row flex-col  items-start justify-start gap-[29px]">
          <div className="flex-1 flex flex-col items-start justify-start gap-[6px]">
            <div className="flex flex-col items-start justify-start">
              <b className="w-[335px] relative inline-block">Country</b>
            </div>
            <div className="self-stretch rounded-xl flex flex-row items-start justify-start text-black">
              <div className="flex-1 relative inline-block h-6">
                {ownerInfo.country}
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-start justify-start gap-[6px]">
            <div className="flex flex-col items-start justify-start">
              <b className="w-[335px] relative inline-block">Zipcode</b>
            </div>
            <div className="self-stretch rounded-xl flex flex-row items-start justify-start text-black">
              <div className="flex-1 relative inline-block h-6">
                {ownerInfo.zipcode}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmOwnerInfo;
