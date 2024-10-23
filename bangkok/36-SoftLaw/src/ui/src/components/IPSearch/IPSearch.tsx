
"use client";
import { useState, useEffect } from "react";
import { WalletConnectButton } from "../WalletConnect";
import Link from "next/link";
import TypesComponent from "../ProofOfInnovation/TypesProps";
import Footer from "../Footer";
import InputField from "../ProofOfInnovation/input";

interface SearchResult {
  trademark: string;
  owner: string;
  serialNumber: string;
  status: string;
  price: string;
}

export default function IpSearch() {
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const handleButtonClick = (buttonName: string) => {
    setActiveButton(buttonName);
    // updateFormData("IP Search", { TypeOfIntellectualProperty: buttonName })
  };

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // API call to fetch data
    // useEffect(() => {
    //   const fetchResults = async () => {
    //     const response = await fetch('YOUR_API_URL', {
    //       method: 'POST',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify({ query: setQuery }),
    //     });
    //     const data = await response.json();
    //     setResults(data.results); // Assuming the API returns a 'results' field with the data
    //   };

    //   if (setQuery) fetchResults();
    // }, [setQuery]);

    // Dummy data simulating search results
    const dummyResults: SearchResult[] = [
      {
        trademark: "Tiger",
        owner: "Tiger Industrial Group Co., Ltd. (China)",
        serialNumber: "7883131",
        status: "Live",
        price: "$2,451",
      },
      {
        trademark: "Tiger",
        owner: "Tiger Industrial Group Co., Ltd. (China)",
        serialNumber: "7883131",
        status: "Pending",
        price: "$2,451",
      },
      {
        trademark: "Tiger",
        owner: "Tiger Industrial Group Co., Ltd. (China)",
        serialNumber: "7883131",
        status: "Pending",
        price: "$2,451",
      },
    ];

    setResults(dummyResults);
    setSearchPerformed(true);
  };

  return (
    <div className="bg-[#1C1A11] flex flex-col items-center justify-center scrollable min-[2000px]:w-[2560px]">
      {/* Nav Bar starts min-h-screen */}
      <header className="self-stretch flex py-4 min-[2000px]:px-[320px] px-[200px] items-center bg-[#1C1A11] text-white sticky top-0 z-[100] h-[24] w-full border-b border-[#E5E7EB] backdrop:filter[8px]">
        {/* Desktop View - Full Menu  */}
        <div className="flex justify-between items-start w-full py-[16px]">
          <Link href={"/"} className="">
            <img
              src="/images/Logo.svg"
              className="shrink-0"
              loading="lazy"
              alt="Logo"
            />
          </Link>
          <WalletConnectButton />
        </div>
      </header>
      {/* Nav Bar ends */}

      <div className="flex flex-col w-full  py-[120px] min-[2000px]:px-[320px] px-[200px] scrollable items-start gap-[40px] h-auto">
        <div className="flex justify-between items-center self-stretch">
          <TypesComponent
            text="IP SEARCH"
            className="text-[#EFF4F6] font-bold leading-[110%] tracking-[-0.96px] text-[48px]"
          />

          <div className="flex items-end justify-between space-x-[16px]">
            <TypesComponent
              isActive={activeButton === "PATENT"}
              text="PATENT"
              className={`
                 py-[8px] px-[16px] rounded-md ${
                   activeButton === "PATENT"
                     ? "text-[#F6E18B] border border-[#F6E18B]  bg-[#373737]"
                     : "border-[#8A8A8A] text-[#fff]"
                 } 
                hover:text-[#F6E18B]
                 hover:border-[#F6E18B] hover:bg-[#373737]
                `}
              onClick={() => {
                handleButtonClick("PATENT");
              }}
            />
            <TypesComponent
              isActive={activeButton === "TRADEMARK"}
              text="TRADEMARK"
              className={`py-[8px] px-[16px] rounded-md ${
                activeButton === "TRADEMARK"
                  ? "border text-[#F6E18B] border-[#F6E18B] bg-[#373737]"
                  : "border-[#8A8A8A] text-[#fff]"
              } 
                hover:text-[#F6E18B] hover:border-[#F6E18B] hover:bg-[#373737]
                `}
              onClick={() => {
                handleButtonClick("TRADEMARK");
              }}
            />

            <TypesComponent
              isActive={activeButton === "COPYRIGHT"}
              text="COPYRIGHT"
              className={`py-[8px] px-[16px] rounded-md ${
                activeButton === "COPYRIGHT"
                  ? "border border-[#F6E18B] bg-[#373737] text-[#F6E18B]"
                  : "border-[#8A8A8A] text-[#fff]"
              } 
                hover:text-[#F6E18B] hover:border-[#F6E18B] hover:bg-[#373737]
                `}
              onClick={() => {
                handleButtonClick("COPYRIGHT");
              }}
            />
          </div>
        </div>


         {/* Search and filter */}
        <div className="w-full  p-4">
        <form onSubmit={handleSearch} className="flex flex-col items-start justify-start">
          <div className="relative w-full flex ">
            <input
              type="text"
              id="search"
              placeholder="Search for Words in Patents, Products, Owners, or Trademark Name"
              className="text-[16px] min-[2000px]:text-2xl flex min-[2000px]:w-5/6 w-full mt-[6px] h-[48px] p-3 items-center pl-[40px] gap-[10px] self-stretch bg-[#27251C] outline-none border-none focus:outline-none rounded-md focus:ring-1 focus:ring-[#FACC15] text-[#fff]"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="submit"
              className="flex items-center justify-center absolute left-2 top-2 bottom-1"
            >
              <img src="/images/searchIcon.svg" alt="search" />
            </button>

          </div>

               {/* Results Section */}
      {searchPerformed && (
        <div className="w-full ">
          <p className="text-[#EFF4F6] font-Montesarrat text-[16px] min-[2000px]:text-[20px] font-normal leading-[145%] tracking-[0.4px] my-[16px] flex items-start">
            {results.length} results for "{query}"
          </p>

          {/* Headings */}
          <div className="flex gap-[50px] w-full justify-between font-bold text-white min-[2000px]:w-[2560px] border-b border-[#8A8A8A] pb-[16px]">
            <TypesComponent text="Trademark Overview"  />
            <TypesComponent text="Owner"
            className=""
           />
             <TypesComponent text="Serial Number" />
             <TypesComponent text="Status" />
             <TypesComponent text="Price" />
          </div>

          <div className="grid gap-4 space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className="flex gap-[60px] text-[#EFF4F6] min-[2000px]:p-[10px] min-[2000px]:gap-[80px] p-4 w-full min-[2000px]:w-[2560px] border-b border-[#8A8A8A]"
              >
                {/* Trademark Overview */}
                <div className="flex items-center space-x-4">
                  <img
                    src={`API_IMAGE_URL/${result.trademark}`}
                    alt={result.trademark}
                    className="w-16 h-16"
                  />

                  <div className="flex flex-col gap-[16px] items-start ">
                  <h3 className="font-Montesarrat text-[14px] font-normal leading-[145%] tracking-[0.28px] text-[#8A8A8A] ">
                    Wordmark{" "}
                    <span className="block text-[#EFF4F6] text-[16px] tracking-[0.32px]">
                    {result.trademark}
                    </span>
                  </h3>

                  <h3 className="font-Montesarrat text-[14px] font-normal leading-[145%] tracking-[0.28px] text-[#8A8A8A] ">
                    Class{" "}
                    <span className="block text-[#EFF4F6] text-[16px] tracking-[0.32px]">
                      007
                    </span>
                  </h3>
                </div>

                </div>

                {/* Owner */}
             
                <TypesComponent
                  text={result.owner}
                  className="text-[#EFF4F6] text-[14px]"
                />
              

                {/* Serial Number */}
                <TypesComponent text={result.serialNumber} className="text-[#EFF4F6]" />
          

                {/* Status */}
                <div className="flex flex-col items-start gap-2">
                <TypesComponent
                  text= {result.status.includes("Live") && (
                    <span className="text-green-500">Live</span>
                  )}
                  className="bg-[#373737] rounded-[36px] text-[#CBCBCB] py-1 px-2"
                />

                <TypesComponent
                  text={result.status.includes("Pending") && (
                    <span className="text-yellow-500 ml-2">Pending</span>
                  )}
                  className="bg-[#373737] rounded-[36px] text-[#CBCBCB] py-1 px-2"
                />
                 
                </div>

                {/* Price */}
                <TypesComponent
                  text={result.price}
                  className=" font-bold text-[#EFF4F6]"
                />
                
              </div>
            ))}
          </div>
        </div>
      )}
        </form>
      </div>


      </div>

      {/* Search Box */}
      

     
    </div>
  );
}
