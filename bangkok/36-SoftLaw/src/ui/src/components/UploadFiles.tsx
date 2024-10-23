import React, { useState, ChangeEvent, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useIpfs } from '../context/ipfs';
import uploadFilePinata from '../utils/pinataPin';

interface FileUploadResult {
  IpfsHash?: string;
  className?: string;
}

const UploadMultipleFilesToIPFS: React.FC<FileUploadResult> = ({className, IpfsHash}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const { ipfsHashes, setIpfsHashes, setImageHash, setImagesLinks } = useIpfs();

  const handleIpfsHashes = useCallback(() => {
    const hashesArray = ipfsHashes ? ipfsHashes.split(',') : [];

    const addHashes = (newHashes: string[]) => {
      const updatedHashesArray = [...hashesArray, ...newHashes];
      setIpfsHashes(updatedHashesArray.join(','));
    };

    const removeHash = (hashToRemove: string) => {
      const updatedHashesArray = hashesArray.filter(hash => hash !== hashToRemove);
      setIpfsHashes(updatedHashesArray.join(',') || null);
    };

    const getHashes = () => hashesArray;

    return { addHashes, removeHash, getHashes };
  }, [ipfsHashes, setIpfsHashes]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);

    if (files.length === 0) {
      // toast.info("No files selected");
    } else {
      // toast.info(`${files.length} file(s) selected`);
    }
  };

  const uploadImagesToIPFS = async (files: File[]): Promise<string[]> => {
    try {
        // Upload Images and get hashes
        const imageHashes = await Promise.all(
            files.map(async (file) => {
                const result: FileUploadResult = await uploadFilePinata(file);
                return result.IpfsHash; // This can be string or undefined
            })
        );

        // Filter out undefined values
        const validImageHashes = imageHashes.filter((hash): hash is string => hash !== undefined);

        // Create url for images
        const imageUrls = validImageHashes.map(hash => `https://harlequin-quiet-smelt-978.mypinata.cloud/ipfs/${hash}`);

        // Json with all the urls
        const imagesMetadata = { imageUrls };
        const metadataBlob = new Blob([JSON.stringify(imagesMetadata)], { type: "application/json" });

        // Convert Blob to File
        const metadataFile = new File([metadataBlob], "metadata.json", { type: "application/json" });

        const ipfsMetadata: FileUploadResult = await uploadFilePinata(metadataFile);

        // get hash from json
        const metadataCid = ipfsMetadata.IpfsHash;
        const metadataUrl = `https://harlequin-quiet-smelt-978.mypinata.cloud/ipfs/${metadataCid}`;
        console.log("CID del JSON con todos los enlaces de imágenes:", metadataUrl);

        // save json of hash
        setImageHash(metadataUrl);

        // Update image links in the context
        setImagesLinks(imageUrls);

        // return only valid hashes of images
        return validImageHashes; // Change this to validImageHashes
    } catch (error) {
        console.error("Error handling images with Pinata:", error);
        return [];
    }
};

  const handleUpload = async () => {
    // toast.info("Uploading your files");

    try {
      const newImageHashes = await uploadImagesToIPFS(selectedFiles);
      const { addHashes } = handleIpfsHashes();
      addHashes(newImageHashes);

    } catch (error) {
      console.error("Error uploading files:", error);
      // toast.error("Error uploading files");
    }
  };

  return (
    <div className={className}>
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
          <p className="text-center min-[2000px]:text-3xl">No Files Selected</p>
        </div>
      )}
      {selectedFiles.length > 0 && (
        <div>
          <p className="text-center min-[2000px]:text-3xl">{selectedFiles.length} Files Selected</p>
        </div>
      )}
      <button 
        className={`rounded-3xl flex flex-row items-center justify-start py-[16px] px-[16px] border-[1px] border-solid border-darkslategray cursor-pointer mt-2 disabled:cursor-not-allowed min-[2000px]:text-3xl min-[2000px]:tracking-[1px] ${className}`}
        onClick={handleUpload}
        disabled={selectedFiles.length === 0}
      >
        Upload to IPFS
      </button>
    </div>
  );
};

export default UploadMultipleFilesToIPFS;