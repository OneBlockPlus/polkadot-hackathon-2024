"use client";
import MaxWidthWrapper from "@/components/MaxWidhWrapper";
import ReusableHeading from "../../textComponent";
import TypesComponent from "../../TypesProps";
import React, { useState, useCallback, useEffect } from "react";
import { useInnovationContext } from "@/context/innovation";
import ConfirmationModal from "./confirmation";
import UploadMultipleFilesToIPFS from "@/components/UploadFiles";
import uploadFilePinata from "@/utils/pinataPin";
import { useToast } from "@/hooks/use-toast";
import Loading from "@/components/Loading";

interface FileUploadResult {
  IpfsHash: string;
  className: string;
}

export default function IpDetails() {
  const {
    selectedTabInnovation,
    setSelectedTabInnovation,
    nftMetadata,
    setMetadataHash,
    nftMetadataUrl,
    setNftMetadataUrl,
    setNftMetadata,
    metadataHash,
    ipfsHashes,
    imageHash,
    imagesLinks,
    loading,
    setLoading,
    setIpfsHashes,
    setImageHash,
    setImagesLinks,
  } = useInnovationContext();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("collections");

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleIpfsHashes = useCallback(() => {
    const hashesArray = ipfsHashes ? ipfsHashes.split(",") : [];

    const addHashes = (newHashes: string[]) => {
      const updatedHashesArray = [...hashesArray, ...newHashes];
      setIpfsHashes(updatedHashesArray.join(","));
    };

    const removeHash = (hashToRemove: string) => {
      const updatedHashesArray = hashesArray.filter(
        (hash) => hash !== hashToRemove
      );
      setIpfsHashes(updatedHashesArray.join(",") || null);
    };

    const getHashes = () => hashesArray;

    return { addHashes, removeHash, getHashes };
  }, [ipfsHashes, setIpfsHashes]);

  const handleEditPage = (page: number) => {
    // Assuming 'collections' = page 1, 'nfts' = page 2, 'contracts' = page 3
    const tabKeys = ["IpRegistries", "Identity", "LegalContracts"];
    setActiveTab(tabKeys[page - 1]); // Navigate to the right tab/page
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleBack = async () => {
    try {
      setSelectedTabInnovation("1");
      console.log("test", selectedTabInnovation);
    } catch (e) {
      console.log(e);
    }
  };

  const uploadImagesToIPFS = async (files: File[]): Promise<string> => {
    try {
      // Upload Images and get hashes
      const imageHashes = await Promise.all(
        files.map(async (file) => {
          const result: FileUploadResult = await uploadFilePinata(file);
          return result.IpfsHash; // This can be string or undefined
        })
      );

      // Filter out undefined values
      const validImageHashes = imageHashes.filter(
        (hash): hash is string => hash !== undefined
      );

      // Create url for images
      const imageUrls = validImageHashes.map(
        (hash) =>
          `https://harlequin-quiet-smelt-978.mypinata.cloud/ipfs/${hash}`
      );

      // Json with all the urls
      const imagesMetadata = { imageUrls };
      const metadataBlob = new Blob([JSON.stringify(imagesMetadata)], {
        type: "application/json",
      });

      // Convert Blob to File
      const metadataFile = new File([metadataBlob], "metadata.json", {
        type: "application/json",
      });

      const ipfsMetadata: FileUploadResult = await uploadFilePinata(
        metadataFile
      );

      // get hash from json
      const metadataCid = ipfsMetadata.IpfsHash;
      const metadataUrl = `https://harlequin-quiet-smelt-978.mypinata.cloud/ipfs/${metadataCid}`;
      console.log(
        "CID del JSON con todos los enlaces de imágenes:",
        metadataUrl
      );

      // save json of hash
      setImageHash(metadataUrl);

      // Update image links in the context
      setImagesLinks(imageUrls);

      setNftMetadata({
        ...nftMetadata,
        image: imageUrls,
      });

      const metadataBlob2 = new Blob([JSON.stringify(nftMetadata)], {
        type: "application/json",
      });

      // Convertir Blob a File
      const metadataFile2 = new File([metadataBlob2], "metadata.json", {
        type: "application/json",
      });

      const ipfsMetadata2: FileUploadResult = await uploadFilePinata(
        metadataFile2
      );

      // get hash from json
      const metadataCid2 = ipfsMetadata2.IpfsHash;

      const metadataUrl2 = `https://harlequin-quiet-smelt-978.mypinata.cloud/ipfs/${metadataCid}`;
      console.log(
        "CID del JSON con todos los enlaces de imágenes:",
        metadataUrl
      );
      setMetadataHash(metadataCid2);
      setNftMetadataUrl(metadataUrl2);

      return metadataCid2;
    } catch (error) {
      console.error("Error handling images with Pinata:", error);
      return "";
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);

    if (files.length === 0) {
      toast({
        title: "No Files",
        description: "No Files Selected",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Files Selected",
        description: "`${files.length} file(s) selected`",
        className: "bg-[#252525] text-white border-[#373737]",
      });
    }
  };

  const handleUploadFinalMetadata = async () => {
    //Aqui va la funcionde set Images Links

    if (!imagesLinks) {
      toast({
        title: "Error Setting all metadata",
        description: "Please try adding images",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      setNftMetadata({
        ...nftMetadata,
        image: imagesLinks,
      });
    } catch (e) {
      console.error("error setting the metadata", e);
    }
    try {
      // Convertir metadata a Blob
      const metadataBlob = new Blob([JSON.stringify(nftMetadata)], {
        type: "application/json",
      });

      // Convertir Blob a File
      const metadataFile = new File([metadataBlob], "metadata.json", {
        type: "application/json",
      });

      const ipfsMetadata: FileUploadResult = await uploadFilePinata(
        metadataFile
      );

      // get hash from json
      const metadataCid = ipfsMetadata.IpfsHash;

      const metadataUrl = `https://harlequin-quiet-smelt-978.mypinata.cloud/ipfs/${metadataCid}`;
      console.log(
        "CID del JSON con todos los enlaces de imágenes:",
        metadataUrl
      );
      setMetadataHash(metadataCid);
      setNftMetadataUrl(metadataUrl);

      return metadataCid;
    } catch (error) {
      console.error("Error uploading metadata:", error);
      return [];
    } finally {
      setIsModalOpen(true);
      setLoading(false);
    }
  };

  ///use efect to upload images automatily with the select files button

  useEffect(() => {
    if (selectedFiles) {
      uploadImagesToIPFS(selectedFiles);
    }
  }, [selectedFiles]);

  return (
    <>
      <div className="bg-[#1C1A11] flex flex-col flex-shrink-0 w-full justify-center items-center text-white min-[2000px]:w-[3000px]">
        {loading && <Loading />}
        <MaxWidthWrapper className="flex flex-col self-stretch pt-[120px] justify-center items-center">
          <div className="flex flex-col w-full justify-items-center pb-[120px] gap-[60px]">
            <div className="">
              <ReusableHeading
                text="NFT DETAIL"
                detail="This  will be visible and encrypted within this NFT on the blockchain."
                className="text-[#8A8A8A]"
              />
            </div>

            <div>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                style={{ display: "none" }}
                id="file-upload-input"
              />
              <label
                htmlFor="file-upload-input"
                className="mt-4 rounded-3xl flex flex-row items-center text-center justify-center py-[16px] text-[16px] px-[16px] border-[1px] border-solid border-darkslategray cursor-pointer min-[2000px]:text-3xl min-[2000px]:tracking-[1px]"
              >
                Select Files
              </label>
              {selectedFiles.length === 0 && (
                <div>
                  <p className="text-center pt-3 min-[2000px]:text-3xl">
                    No Files Selected
                  </p>
                </div>
              )}
              {selectedFiles.length > 0 && (
                <div>
                  <p className="text-center min-[2000px]:text-3xl">
                    {selectedFiles.length} Files Selected
                  </p>
                </div>
              )}

              {imagesLinks?.map((value) => (
                <img src={value} />
              ))}
            </div>

            {/*           

            <div className="flex flex-col gap-[16px] pt-[60px]">
              <TypesComponent
                text="Types of protection"
                className="text-[#fff]"
              />
            </div> */}

            <div className="flex items-start justify-between w-full ">
              <button
                className="bg-transparent rounded-[16px] px-[20px] py-[8px] w-[128px] items-center text-center min-[2000px]:py-[16px] min-[2000px]:tracking-[1px] min-[2000px]:text-3xl min-[2000px]:w-[200px] flex-shrink-0 border border-[#D0DFE4] text-[#D0DFE4] hover:bg-[#FACC15]  hover:text-[#1C1A11] hover:border-none"
                onClick={handleBack}
              >
                Back
              </button>
              {/* <button
                onClick={() => {
                  console.log(
                    "Collection Metadata: ",
                    "NFT Metadata:",
                    nftMetadata,
                    "NFT Details:",
                    "IPFS HASHES:",
                    ipfsHashes,
                    "IMAGE HASH",
                    imageHash,
                    "iMAGES lINKS",
                    imagesLinks,
                    "metadata JSON CID",
                    metadataHash
                  );
                }}
                className="bg-[#D0DFE4] min-[2000px]:py-[16px] min-[2000px]:tracking-[1px] min-[2000px]:text-3xl w-[128px] min-[2000px]:w-[200px] items-center text-center rounded-[16px] text-[#1C1A11] px-[22px] py-[8px] flex-shrink-0 hover:bg-[#FACC15]"
              >
                Test
              </button> */}

              <div>
                {/* Once the final page is completed, submit */}
                <button
                  onClick={handleUploadFinalMetadata}
                  // onClick={uploadImagesToIPFS}
                  className="bg-[#D0DFE4] min-[2000px]:py-[16px] min-[2000px]:tracking-[1px] min-[2000px]:text-3xl w-[128px] min-[2000px]:w-[200px] items-center text-center rounded-[16px] text-[#1C1A11] px-[22px] py-[8px] flex-shrink-0 hover:bg-[#FACC15]"
                >
                  Submit
                </button>

                {isModalOpen && (
                  <ConfirmationModal
                    onClose={handleCloseModal}
                    onEditPage={handleEditPage}
                  />
                )}
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
      </div>
    </>
  );
}
