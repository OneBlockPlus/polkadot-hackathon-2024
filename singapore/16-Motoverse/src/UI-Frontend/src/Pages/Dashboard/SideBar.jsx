import { Link } from "react-router-dom";

const SideBar = () => {
  return (
    
    <div className="self-stretch md:w-[240px] max-w-full h-auto md:pt-[40px] md:pb-[16px] flex flex-col items-start gap-m box-border border-r border-[#BEC6FF] bg-[#F3F3F6]">
      <div className="self-stretch w-full md:px-[20px] flex flex-col items-start gap-[8px]">
       
        <Link
          to=""
          className="self-stretch w-full flex items-center md:py-[8px] md:px-[16px] md:gap-[8px] bg-[#003855] rounded-[41px]"
          target=""
        >
          <img src="/images/house.svg" className="" loading="lazy" alt="Logo" />
          <p className="text-base font-karla font-[400] leading-normal text-white">
            Overview
          </p>
        </Link>

        <Link
          to="/Garage.jsx"
          className="self-stretch w-[160px] flex items-center md:py-[8px] md:px-[16px] md:gap-[8px] bg-transparent rounded-[41px]"
          target=""
        >
          <img
            src="/images/MyGarage.svg"
            className=""
            loading="lazy"
            alt="Logo"
          />
          <p className="text-base font-karla font-[400] leading-normal text-[#003855]">
            My Garage
          </p>
        </Link>

        <Link
          to="/HeroTwo.jsx"
          className="self-stretch flex items-center md:py-[8px] md:px-[16px] md:gap-[8px] bg-transparent rounded-[41px]"
          target=""
        >
          <img
            src="/images/VerificationCheck.svg"
            className=""
            loading="lazy"
            alt="Logo"
          />
          <p className="text-base font-karla font-[400] leading-normal text-[#003855]">
            Verification
          </p>
        </Link>

        <Link
          to=""
          className="self-stretch flex items-center md:py-[8px] md:px-[16px] md:gap-[8px] bg-transparent rounded-[41px]"
          target=""
        >
          <img
            src="/images/Settings.svg"
            className=""
            loading="lazy"
            alt="Logo"
          />
          <p className="text-base font-karla font-[400] leading-normal text-[#003855]">
            Setting
          </p>
        </Link>
      </div>
    </div>
  );
};

export default SideBar;
