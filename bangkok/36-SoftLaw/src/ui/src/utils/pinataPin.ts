const uploadFilePinata = async (fileToUpload: File): Promise<any> => {
    try {
      // Convert file to FormData
      const formData = new FormData();
      formData.append("file", fileToUpload, fileToUpload.name);
  
      // Upload the file to Pinata
      const uploadUrl = "https://api.pinata.cloud/pinning/pinFileToIPFS";
      const uploadOptions: RequestInit = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
        },
        body: formData,
      };
  
      const uploadResponse = await fetch(uploadUrl, uploadOptions);
  
      if (!uploadResponse.ok) {
        throw new Error(`Error uploading file: ${uploadResponse.statusText}`);
      }
  
      const uploadData = await uploadResponse.json();
      console.log("File uploaded to IPFS:", uploadData);
      return uploadData;
  
    } catch (error) {
      console.error("Error uploading file to Pinata:", error);
      alert("Trouble uploading file");
      return null;
    }
  };
  
  export default uploadFilePinata;
  