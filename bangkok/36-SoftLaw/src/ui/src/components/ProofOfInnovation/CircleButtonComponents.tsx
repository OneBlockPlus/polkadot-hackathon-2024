"use client";
import { useState, useEffect } from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation'

const CircleButton = () => {
const pathname = usePathname()
const [active, setActive] = useState<number | null>(null);

// Effect to set the active button based on the current pathname
useEffect(() => {
    if (pathname === "/dashboard") {
      setActive(1);
    } else if (pathname === "/Identity") {
      setActive(2);
    } else if (pathname === "/nft-details") { // Update with actual path
      setActive(3);
    } else {
      setActive(null); // Reset if no match
    }
  }, [pathname]);

const handleClick = (buttonIndex: number) => {
  setActive(buttonIndex); // Set the active button
};

  return (
    <div className="flex items-center space-x-4">
      {/* button 1 */}

      <div className="flex items-center space-x-2">
        <Link
          className={` link ${active === 1 ? 'bg-yellow-500 text-black' : 'bg-white text-black'} flex w-10 h-10 items-center justify-center align-center rounded-full cursor-pointer` }
          href="/dashboard"
          onClick={() => handleClick(1)} // Set button 1 as active
        >
          <h1 className="font-karla text-[16px] text-center items-center justify-center font-normal leading-normal">
            1
          </h1>
        </Link>
        <h1
          className={`font-Karla text-[16px] font-normal leading-normal text ${
            active === 1 ? 'text-[#F6E18B]' : ' text-white'
          }`}
        >
          Selection
        </h1>
        <span className="w-[16px] h-[1px] bg-[#B2CBD3]"/>
      </div>

      {/* button 2 */}
      <div className="flex items-center space-x-2">
        <Link
         className={` link ${active === 2 ? 'bg-yellow-500 text-black' : 'bg-white text-black'} flex w-10 h-10 items-center justify-center align-center rounded-full cursor-pointer` }
         href="/Identity" target="__blanc"
         onClick={() => handleClick(2)} // Set button 2 as active
        >
          <h1 className="font-karla text-[16px] font-normal leading-normal">
            2
          </h1>
        </Link>
        <h1
          className={`font-Karla text-[16px] font-normal leading-normal text ${
            active === 2 ? 'text-[#F6E18B]' : ' text-white'
          }`}
        >
          IP Data
        </h1>
        <span className="w-[16px] h-[1px] bg-[#B2CBD3]"/>
      </div>

      {/* button 3 */}
      <div className="flex items-center space-x-2">
        <Link
          className={` link ${active === 3 ? 'bg-yellow-500 text-black' : 'bg-white text-black'} flex w-10 h-10 items-center justify-center align-center rounded-full cursor-pointer` }
          href="/nft-details"
          onClick={() => handleClick(3)} // Set button 3 as active
        >
          <h1 className="font-karla text-[16px] font-normal leading-normal">
            3
          </h1>
        </Link>
        <h1
          className={`font-Karla text-[16px] font-normal leading-normal text ${
            active === 3 ? 'text-[#F6E18B]' : ' text-white'
          }`}
        >
          NFT Detail
        </h1>
      </div>
    </div>
  );
};

export default CircleButton;

















































// "use client";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import IpRegistries from "./registry";
// import Identity from "./identity";
// import LegalContracts from "./legalContracts";

// const CircleButton = () => {
//   return (
//     <Tabs defaultValue="collections" className="flex w-full h-full">
//       <TabsList className="flex items-center space-x-4">
//         {/* button 1 */}
//         <div className="flex items-center space-x-2">
//           <TabsTrigger
//             value="collections"
//             className="flex w-10 h-10 items-center justify-center rounded-full bg-white text-black cursor-pointer"
//           >
//             <h1 className="font-karla text-[16px] font-normal leading-normal">1</h1>
//           </TabsTrigger>
//           <h1 className="font-Karla text-[16px] font-normal leading-normal text-white">
//             Selection
//           </h1>
//           <span className="w-[16px] h-[1px] bg-[#B2CBD3]" />
//         </div>

//         {/* button 2 */}
//         <div className="flex items-center space-x-2">
//           <TabsTrigger
//             value="nfts"
//             className="flex w-10 h-10 items-center justify-center rounded-full bg-white text-black cursor-pointer"
//           >
//             <h1 className="font-karla text-[16px] font-normal leading-normal">2</h1>
//           </TabsTrigger>
//           <h1 className="font-Karla text-[16px] font-normal leading-normal text-white">
//             IP Data
//           </h1>
//           <span className="w-[16px] h-[1px] bg-[#B2CBD3]" />
//         </div>

//         {/* button 3 */}
//         <div className="flex items-center space-x-2">
//           <TabsTrigger
//             value="legal-contracts"
//             className="flex w-10 h-10 items-center justify-center rounded-full bg-white text-black cursor-pointer"
//           >
//             <h1 className="font-karla text-[16px] font-normal leading-normal">3</h1>
//           </TabsTrigger>
//           <h1 className="font-Karla text-[16px] font-normal leading-normal text-white">
//             NFT Detail
//           </h1>
//         </div>
//       </TabsList>

//       {/* Content Section */}
//       <TabsContent value="collections">
//         <IpRegistries />
//       </TabsContent>
//       <TabsContent value="nfts">
//         <Identity />
//       </TabsContent>
//       <TabsContent value="legal-contracts">
//         <LegalContracts />
//       </TabsContent>
//     </Tabs>
//   );
// };

// export default CircleButton;


