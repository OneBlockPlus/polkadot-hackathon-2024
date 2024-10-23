"use client";
import MaxWidthWrapper from "@/components/MaxWidhWrapper";
// import { getSdkContract } from "@/utils/getSDK";
// import { ethers } from "ethers";

import { useState } from "react";
import abi from "../../../utils/abi_minter.json";
import { useToast } from "@/hooks/use-toast";
// import { Abi } from "@unique-nft/sdk/full";
import UploadMultipleFilesToIPFS from "@/components/UploadFiles";
import { useUnique } from "@/context/unique";
import { useIpfs } from "@/context/ipfs";
import Image from "next/image";

interface AbiInput {
  name: string;
}
interface AbiOutput {
  internalType: string;
  name: string;
  type: string;
  components?: AbiOutput[];
}
interface AbiItem {
  name: string;
  inputs?: AbiInput[];
  outputs?: AbiOutput[];
}
declare type Abi = AbiItem[];

export default function Nft() {
  const [loading, setLoading] = useState<boolean>(false);
  const { collectionAddress } = useUnique();
  // State for form fields
  const [ipNumber, setIpNumber] = useState<string>("");
  const [jurisdiction, setJurisdiction] = useState<string>("");
  const [ownerName, setOwnerName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [filingDate, setFilingDate] = useState<string>("");
  const {
    ipfsHashes,
    setIpfsHashes,
    setImageHash,
    setImagesLinks,
    imageHash,
    imagesLinks,
  } = useIpfs();

  const { toast } = useToast();

  const abiTyped = abi as Abi;

  const createNFTSC = async () => {
    console.log("test nft")
  };
  return (
    <MaxWidthWrapper>
      {/* <p>
        <strong>Collection Address:</strong> {collectionAddress}
      </p>
      <div className="mt-4">
        <label>IP Number</label>
        <input
          type="text"
          value={ipNumber}
          onChange={(e) => setIpNumber(e.target.value)}
          className="w-full p-2 border rounded text-black"
        />

        <label>Jurisdiction</label>
        <input
          type="text"
          value={jurisdiction}
          onChange={(e) => setJurisdiction(e.target.value)}
          className="w-full p-2 border rounded text-black"
        />

        <label>Owner Name</label>
        <input
          type="text"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          className="w-full p-2 border rounded text-black"
        />

        <label>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded text-black"
        />

        <label>Filing Date</label>
        <input
          type="date"
          value={filingDate}
          onChange={(e) => setFilingDate(e.target.value)}
          className="w-full p-2 border rounded text-black"
        />
      </div>

      <UploadMultipleFilesToIPFS /> */}

      {imagesLinks &&
        imagesLinks.map((image, index) => (
          <Image
            key={index}
            src={image}
            alt={`Image ${index + 1}`}
            width={250} 
            height={150} 
          />
        ))}

      <button
        className={
          "mt-4 text-white hover:bg-white hover:text-blue-500 border border-yellow-400 rounded px-4 py-2 "
        }
        onClick={createNFTSC}
      >
        Mint NFT
      </button>
      <button
        onClick={() => {
          console.log(imageHash);
        }}
      >
        test
      </button>
    </MaxWidthWrapper>
  );
}
