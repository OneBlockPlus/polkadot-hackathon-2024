import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="self-stretch w-full h-auto flex flex-col sm:flex-row items-start gap-[60px] sm:justify-between bg-[#111B3C] px-6 md:px-12 py-[25px]">
      <div className="flex justify-between sm:items-start flex-1 w-full ">
        <div className="flex flex-col  items-start flex-1 font-karla gap-[16px] text-base w-full min-[2000px]:text-xl">
          <Link to="/About.jsx" className="font-bold  text-[#BEC6FF]">
            About
          </Link>
          <Link to="https://copper-ready-guanaco-464.mypinata.cloud/ipfs/QmfDS3G1zvgt8UnEPg4nwGemhhtW4hPoQjP6HSHDTb1VZr" 
          className="text-[#F8F8FF] font-[400]"
          target="_blank">
            Litepaper
          </Link>
          <Link to="https://polkadot.js.org/apps/?rpc=wss://fraa-flashbox-4424-rpc.a.stagenet.tanssi.network#/explorer" 
          className="text-[#F8F8FF] font-[400]"
          target="_blank">
            Chain Explorer
          </Link>
        </div>

        <div className="flex flex-col items-start flex-1 font-karla gap-[16px] text-base w-full min-[2000px]:text-xl">
          <Link to="/" className="font-bold text-[#BEC6FF]">
            Get in Touch
          </Link>
          <Link
            to="https://twitter.com/motoverse_glob"
            className="text-[#F8F8FF] font-[400]"
            target="_blank"
          >
            Twitter
          </Link>
          <Link
            to="https://www.instagram.com/motoverse.global/"
            className="text-[#F8F8FF] font-[400]"
            target="_blank"
          >
            Instagram
          </Link>
          <Link
            to="https://www.linkedin.com/company/motoverse-glob"
            className="text-[#F8F8FF] font-[400]"
            target="_blank"
          >
            LinkedIn
          </Link>
        </div>
        <div className="flex flex-col items-start flex-1 font-karla gap-[16px] text-base w-full min-[2000px]:text-xl">
          <Link
            to="https://discord.gg/X39mX7VEPq"
            className="text-[#F8F8FF] font-[400]"
            target="_blank"
          >
            Discord
          </Link>
          <Link
            to="https://t.me/Motoverse_glob"
            className="text-[#F8F8FF] font-[400]"
            target="_blank"
          >
            Telegram
          </Link>
          <Link
            to="https://docs.google.com/forms/d/e/1FAIpQLSc80M1m1SUrRGXm6mOP53I-AWpSuQO41STXB8zBwWHP0beZUA/viewform"
            className="text-[#F8F8FF] font-[400]"
            target="_blank"
          >
            Ambassadors Program
          </Link>
        </div>
      </div>

      <div className="text-white">
        <div className="flex items-center gap-2">
          <img className="size-[60px]" alt="" src="images/newlogo.svg" />
          <h1 className="text-[#ECEDFF] font-karla items-start text-[50px] uppercase font-[500] mt-[-10px] ">
            Motoverse
          </h1>
        </div>
        <span className="inline-block ml-[68px]  text-[16px]  font-[400] leading-normal min-[2000px]:text-xl">
          {" "}
          Softlaw LLC 2024 all right reserved ©
        </span>
      </div>
     
    </footer>
  );
};

export default Footer;
