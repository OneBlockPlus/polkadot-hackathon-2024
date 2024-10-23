"use client";
import MaxWidthWrapper from "@/components/MaxWidhWrapper";
// import { getSdkContract } from "@/utils/getSDK";
// import { getSubstrateSigner } from "@/utils/getSigner";
// import { ethers } from "ethers";
// import { Address } from "@unique-nft/utils";
import { useState } from "react";
// import abi from "../../../utils/abi_minter.json";
import { useToast } from "@/hooks/use-toast";
// import { Abi } from "@unique-nft/sdk/full";
import UploadMultipleFilesToIPFS from "@/components/UploadFiles";
import { useUnique } from "@/context/unique";
import { useIpfs } from "@/context/ipfs";
import Image from "next/image";

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

  // const { toast } = useToast();

  // const abiTyped = abi as Abi;

  return (
    <MaxWidthWrapper>
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
        // onClick={createNFTSC}
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
