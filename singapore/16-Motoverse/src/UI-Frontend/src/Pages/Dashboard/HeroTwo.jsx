import { Link } from "react-router-dom";
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid'

const HeroTwo = () => {
  return (
    <div className="self-stretch flex flex-col items-start gap-[12px]">
      {/* header starts */}
      <div className="self-stretch flex flex-col items-start gap-2 font-manrope text-[#003855]">
        <h3 className="text-[39px] leading-[120%] font-bold ">
          Hello, John Smith
          <p className="items-start text-base text-inherit leading-normal font-[400]">
            Welcome to your dashboard, this is your space to view and manage all
            the moving parts of your account.
          </p>
        </h3>
        <p className=" text-inherit gap-[12px] flex items-center">
          Tier 1: <span className="font-bold">Observer</span>
          <img src="/images/InfoIcon.svg" loading="Lazy" alt="" className="" />
        </p>
      </div>
      {/* header ends */}

      {/* ---------------------------notice section--------------------- */}
      <div className="self-stretch flex flex-col items-center gap-[12px] rounded-2xl font-manrope md:p-[16px] box-border bg-[#ECEDFF]">
        {/* notice Heading starts */}
        <p className="self-stretch flex items-start gap-[60px] font-[400] leading-normal flex-1 justify-between font-manrope text-[#003855] text-[20px]">
          Update your information to unlock other features
          <span className="text-base">hide</span>
        </p>
        {/* notice Heading ends */}

        {/* line */}
        <div className="self-stretch border-t-[1px] border-[#BEC6FF]" />
        {/* line ends */}

        {/* notice body content starts */}
        <div className="self-stretch w-full flex flex-col items-end gap-[20px] text-[#4D28FF]">
          {/* Left hand side */}
          <div className="self-stretch w-full flex justify-between font-karla text-base">
            <p className="flex gap-[12px] text-[#003855]">
              Tier 2:
              <span className="font-bold leading-normal">Buyer and Seller</span>
            </p>
            {/* Left hand side ends */}

            {/* Right hand side starts */}
            <div className=" font-karla flex items-center justify-end gap-[40px] text-[#003855]">
              <div className="w-full flex flex-1 items-center gap-[20px]">
                <div className="md:w-[300px] h-[8px] flex flex-1 flex-col items-start gap-[56px] rounded-full bg-[#FBFBFB]" />
                <div className="absolute h-2 w-[132px] rounded-full bg-[#43C705]" />
                <h6 className="font-[400] text-inherit text-base text-center">
                  80%
                </h6>
              </div>
              <Link to="" className="">
              <ChevronUpIcon aria-hidden="true" className=" h-[24px] w-[24px] text-[#858586]" />
                {/* <img
                  className="w-full "
                  loading="lazy"
                  alt=""
                  src=""
                  
                /> */}
              </Link>
            </div>
            {/* Right hand side ends */}
          </div>

          {/* verifications starts */}
          <div className="self-stretch w-full grid grid-cols-2 items-center justify-between gap-[40px] text-[#1F353C] pl-[60px]">
            {/* Identity Verification */}
            <div className="w-full flex flex-col min-w-[200px] items-start gap-[16px]">
              <h6 className="self-stretch flex flex-col items-start gap-2 font-karla font-bold leading-normal text-center">
                <div className="flex items-start gap-2">
                  Identity Verification
                <span className="flex items-start gap-[8px]"><img src="/images/Checkmark.svg" loading="Lazy" alt="" className="" />
                    Verified</span>
                </div>
                
                <p className="text-base text-[#003855] flex flex-col font-[400] items-start leading-normal">
                  Requirements: Basic information,{" "}
                  <span className="block ">setup wallet, and password</span>
                </p>
              </h6>
              <Link
                to="/DashProgress"
                className="w-[168px] rounded-full bg-[#4E7FFF] flex items-center justify-center md:px-[16px] md:py-[4px]"
                target=""
              >
                <p className="font-[400] font-karla text-base text-white text-center">
                  Verify My Identity
                </p>
              </Link>
            </div>
            {/* Identity Verification ends*/}

            {/* Address Verification starts*/}
            <div className="w-full min-w-[200px] flex flex-col items-start gap-[16px] font-manrope">
              <h6 className="self-stretch flex flex-col items-start gap-2 font-karla font-bold leading-normal">
                Address Verification
                <span className="text-base text-[#003855] flex flex-col font-[400] items-start">
                  Requirement: Proof of address, identification document
                </span>
              </h6>
              <Link
                to=""
                className="w-[168px] rounded-full bg-[#4E7FFF] flex items-center justify-center md:px-[16px] md:py-[4px]"
                target=""
              >
                <p className="font-[400] font-karla text-base text-white text-center">
                  Verify My Identity
                </p>
              </Link>
            </div>
            {/* Address Verification ends*/}
          </div>
          {/* verifications ends */}

          {/* line */}
          <div className="self-stretch border-t-[1px] border-[#BEC6FF]" />
          {/* line ends */}

          {/* Tier 3 starts */}
          {/* Left hand side */}
          <div className="self-stretch w-full flex justify-between font-karla text-base">
            <p className="flex gap-[12px] text-[#003855]">
              Tier 3:
              <span className="font-bold leading-normal">Vehicle Verifier</span>
            </p>
            {/* Left hand side ends */}

            {/* Right hand side starts */}
            <div className=" font-karla flex items-center justify-end gap-[40px] text-[#003855]">
              <div className="w-full flex flex-1 items-center gap-[20px]">
                <div className="md:w-[300px] h-[8px] flex flex-1 flex-col items-start rounded-full bg-[#FBFBFB]" />
                <div className="absolute h-2 w-2 rounded-full bg-[#43C705]" />
                <h6 className="font-[400] text-inherit text-base text-center">
                  0%
                </h6>
              </div>
              <Link to="" className="">
              <ChevronDownIcon aria-hidden="true" className=" h-[24px] w-[24px] text-[#858586]" />
                {/* <img
                  className="w-full "
                  loading="lazy"
                  alt=""
                  src="/images/downArrowIcon.svg"
                /> */}
              </Link>
            </div>
            {/* Right hand side ends */}
          </div>
          {/* Tier 3 ends */}
        </div>
      </div>
    </div>
  );
};

export default HeroTwo;
