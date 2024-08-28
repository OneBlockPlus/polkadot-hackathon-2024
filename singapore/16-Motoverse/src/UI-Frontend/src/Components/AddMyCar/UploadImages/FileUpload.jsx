import React, { useState } from 'react';
import { toast } from 'sonner';
import { usePolkaContext } from '../../../context/PolkaContext';
import uploadFilePinata from '../../../utils/pinata/pin'; 

const UploadMultipleFilesToIPFS = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const { ipfsHashes, handleIPFSHashes, setImageHash, setImagesLinks } = usePolkaContext();

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);

    if (files.length === 0) {
      toast.info("No files selected");
    } else {
      toast.info(`${files.length} file(s) selected`);
    }
  };
  const uploadImagesToIPFS = async (files) => {
    try {
      // Upload Images and get hashes
      const imageHashes = await Promise.all(
        files.map(async (file) => {
          const result = await uploadFilePinata(file);
          return result.IpfsHash;
        })
      );

      // C reate url for images
      const imageUrls = imageHashes.map(hash => `https://copper-ready-guanaco-464.mypinata.cloud/ipfs/${hash}`);
      
      // Json with all the urls
      const imagesMetadata = { imageUrls };
      const metadataBlob = new Blob([JSON.stringify(imagesMetadata)], { type: "application/json" });
      const ipfsMetadata = await uploadFilePinata(metadataBlob);
      
      // get hash from json
      const metadataCid = ipfsMetadata.IpfsHash;
      const metadataUrl = `https://copper-ready-guanaco-464.mypinata.cloud/ipfs/${metadataCid}`;
      console.log("CID del JSON con todos los enlaces de imágenes:", metadataUrl);

      // save json of hash
      setImageHash(metadataUrl);

      // Actualizar enlaces de imágenes en el contexto
      setImagesLinks(imageUrls);

      //retur all the hashes of images
      return imageHashes;
    } catch (error) {
      console.error("Error handling images with Pinata:", error);
    }
  };

  const handleUpload = async () => {
    toast.info("Uploading your files");

    try {
      const imageHashes = await uploadImagesToIPFS(selectedFiles);

      // Ensure ipfsHashes is an array
      const existingHashes = Array.isArray(ipfsHashes) ? ipfsHashes : [];
      const newImageHashes = imageHashes; // Los nuevos hashes de imágenes
      const updatedHashes = [...existingHashes, ...newImageHashes];

      // Update Global State with Hashes
      handleIPFSHashes(updatedHashes);

    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Error uploading files");
    }
  };

  return (
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
        className="mt-4 rounded-3xl flex flex-row items-center text-center justify-center py-2.5 px-s border-[1px] border-solid border-darkslategray cursor-pointer"
      >
        <div>Select Files</div>
      </label>
      {selectedFiles.length === 0 && (
        <div>
          <p className="text-center">No Files Selected</p>
        </div>
      )}
      {selectedFiles.length > 0 && (
        <div>
          <p className="text-center">{selectedFiles.length} Files Selected</p>
        </div>
      )}
      <button
        className="rounded-3xl flex flex-row items-center justify-start py-2.5 px-s border-[1px] border-solid border-darkslategray cursor-pointer mt-2 disabled:cursor-not-allowed"
        onClick={handleUpload}
        disabled={selectedFiles.length === 0}
      >
        Upload to IPFS
      </button>
    </div>
  );
};

export default UploadMultipleFilesToIPFS 
