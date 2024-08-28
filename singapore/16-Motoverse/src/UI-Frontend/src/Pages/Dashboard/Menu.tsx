import { usePolkaContext } from "../../context/PolkaContext";
import React from "react";

const MenuDashboard = () => {
  const { selectedTabDashboard, setSelectedTabDashboard } = usePolkaContext();

  const handleTabClick = (_value: number) => {
    setSelectedTabDashboard(_value);
  };

  return (
    <div className="self-stretch md:w-[240px] max-w-full h-auto md:pt-[40px] md:pb-[16px] flex flex-col items-start gap-m box-border border-r border-[#BEC6FF] bg-[#F3F3F6]
">
      <div className="self-stretch full max-w-full flex flex-col px-s font-manrope text-base gap-[8px] bg-[#F3F3F6]">

        {/* Overview */}
        <div
          onClick={() => handleTabClick(0)}
          className={`self-stretch w-full py-[8px] px-[20px] rounded-[41px] cursor-pointer ${
            selectedTabDashboard === 0 ? "bg-[#1F353C]" : "bg-transparent"
          }`}
        >
          <div className="self-stretch w-[160px] h-[24px] flex items-center gap-[8px]">
            <img
              src={selectedTabDashboard === 0 ? "/images/houseWhite.svg": "/images/houseGrey.svg" }
              className="w-[24px] h-[24px]"
              alt="Marketplace"
            />
            <p
              className={`leading-normal ${
                selectedTabDashboard === 0 ? "text-[#ffffff]" : "text-[#1F353C]"
              }`}
            >
              Marketplace
            </p>
          </div>
        </div>

        {/* My Garage */}
        <div
          onClick={() => handleTabClick(1)}
          className={`self-stretch w-full py-[8px] px-[20px] rounded-[41px] cursor-pointer ${
            selectedTabDashboard === 1 ? "bg-[#1F353C]" : "bg-transparent"
          }`}
        >
          <div className="self-stretch w-[160px] h-[24px] flex items-center gap-[8px]">
            <img
              src={selectedTabDashboard === 1 ? "/images/GarageWhite.svg" : "/images/Garage.svg"}
              className="w-[24px] h-[24px]"
              alt="My Garage"
            />
            <p
              className={`leading-normal ${
                selectedTabDashboard === 1 ? "text-[#ffffff]" : "text-[#1F353C]"
              }`}
            >
              My Garage
            </p>
          </div>
        </div>

        {/* Verification */}
        {/* <div
          onClick={() => handleTabClick(2)}
          className={`self-stretch w-full py-[8px] px-[20px] rounded-[41px] cursor-pointer ${
            selectedTabDashboard === 2 ? "bg-[#1F353C]" : "bg-transparent"
          }`}
        >
          <div className="self-stretch w-[160px] h-[24px] flex items-center gap-[8px]">
            <img
              src={selectedTabDashboard === 2 ? "/images/VerificationWhite.svg" : "/images/VerificationGray.svg"}
              className="w-[24px] h-[24px]"
              alt="Verification"
            />
            <p
              className={`leading-normal ${
                selectedTabDashboard === 2 ? "text-[#ffffff]" : "text-[#1F353C]"
              }`}
            >
              Verification
            </p>
          </div>
        </div> */}

        {/* Settings */}
        {/* <div
          onClick={() => handleTabClick(3)}
          className={`self-stretch w-full py-[8px] px-[20px] rounded-[41px] cursor-pointer ${
            selectedTabDashboard === 3 ? "bg-[#1F353C]" : "bg-transparent"
          }`}
        >
          <div className="self-stretch w-[160px] h-[24px] flex items-center gap-[8px]">
            <img
              src={selectedTabDashboard === 3 ? "/images/SettingsWhiteIcon.svg" : "/images/Settings.svg"}
              className="w-[24px] h-[24px]"
              alt="Settings"
            />
            <p
              className={`leading-normal ${
                selectedTabDashboard === 3 ? "text-[#ffffff]" : "text-[#1F353C]"
              }`}
            >
              Settings
            </p>
          </div>
        </div> */}

        {/* transfer */}
        {/* <div
          onClick={() => handleTabClick(4)}
          className={`self-stretch w-full py-[8px] px-[20px] rounded-[41px] cursor-pointer ${
            selectedTabDashboard === 4 ? "bg-[#1F353C]" : "bg-transparent"
          }`}
        >
          <div className="self-stretch w-[160px] h-[24px] flex items-center gap-[8px]">
            <img
              src={selectedTabDashboard === 4 ? "/images/Transfer.svg" : "/images/TransferWhite.svg"}
              className="w-[24px] h-[24px]"
              alt="Settings"
            />
            <p
              className={`leading-normal ${
                selectedTabDashboard === 4 ? "text-[#ffffff]" : "text-[#1F353C]"
              }`}
            >
             Transfer
            </p>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default MenuDashboard;
