const uploadFilePinata = async (fileToUpload) => {
    try {
      // Convert file to FormData
      const formData = new FormData();
      formData.append("file", fileToUpload, fileToUpload.name);
  
      // Upload the file to Pinata
      const uploadUrl = "https://api.pinata.cloud/pinning/pinFileToIPFS";
      const uploadOptions = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_PINATA_TOKEN}`,
        },
        body: formData,
      };
  
      const uploadResponse = await fetch(uploadUrl, uploadOptions);
      const uploadData = await uploadResponse.json();
      console.log("File uploaded to IPFS:", uploadData);
      return uploadData

    } catch (error) {
      console.error("Error uploading file to Pinata:", error);
      alert("Trouble uploading file");
    }
  };
  
  export default uploadFilePinata;
  