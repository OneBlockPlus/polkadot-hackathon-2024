import React from "react";
import Link from "next/link";
import MaxWidthWrapper from "./MaxWidhWrapper";

const currentYear = new Date().getFullYear();
interface FooterProps {
  width?: string;
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ width, className }) => {
  return (
    <>
   
    <footer
        className={`flex ${width} min-h-400px flex-col md:px-[120px] pb-[60px] items-start self-stretch bg-[#1C1A11] min-[2000px]:w-[3000px] gap-[40px]  min-[2000px]:py-[120px] "> ${className}`}
      >
         {/* <MaxWidthWrapper> */}
        <div className="min-[2000px]:pb-5 pb-5">
          <img
            src="/images/logoHero.svg"
            alt="SOFT.LAW"
            className="flex-shrink-0 w-[428px] h-[71.334px] "
          />
        </div>
        <div className="flex pt-[30px] pb-[60px] justify-between items-start gap-[auto] self-stretch text-[13.234px] text-[#FFFFFF] border-t border-[#B2CBD3] font-[400] leading-[20px]  ">
          <h1 className="min-[2000px]:text-xl min-[2000px]:tracking-[2px]">
            Softlaw S.A. de C.V; Mexican Corporation &copy; {currentYear} All
            rights reserved
          </h1>
          <div className="flex items-center justify-between gap-3">
            <Link
              href={"softlaw.vercel.app"}
              className=" min-[2000px]:text-xl min-[2000px]:tracking-[2px]  text-[#FACC15] underline text-[13.627px]"
            >
              Terms
            </Link>
            <Link
              href={"softlaw.vercel.app"}
              className="min-[2000px]:tracking-[2px] min-[2000px]:text-xl   text-[#FACC15] underline text-[13.627px]"
            >
              Privacy
            </Link>
            <Link
              href={"softlaw.vercel.app"}
              className="min-[2000px]:tracking-[2px] min-[2000px]:text-xl   text-[#FACC15] underline text-[13.627px]"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
         {/* </MaxWidthWrapper>    */}
      </footer>

      
    </>
  );
};

export default Footer;
