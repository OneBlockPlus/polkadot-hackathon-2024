const UploadMetadata = () => {
  const handleUpload = async () => {
    // Retrieve data from localStorage
    const availableDates = JSON.parse(localStorage.getItem("AvailableDates"));
    const ownerInformation = JSON.parse(
      localStorage.getItem("OwnerInformation")
    );
    const carDetail = JSON.parse(localStorage.getItem("CarDetail"));
    const ipfsHashes = JSON.parse(localStorage.getItem("ipfsHashes"));

    // Construct metadata object
    const metadata = {
      AvailableDates: availableDates,
      OwnerInformation: ownerInformation,
      CarDetail: carDetail,
      IPFSHashes: ipfsHashes,
    };

    // Convert metadata to JSON
    const metadataJSON = JSON.stringify(metadata);

    // Upload to Pinata
    const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
    const body = JSON.stringify({
      pinataOptions: {
        cidVersion: 1,
      },
      pinataMetadata: {
        name: `metadata.json`,
      },
      pinataContent: metadataJSON,
    });

    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_PINATA_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: body,
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      console.log("Uploaded to IPFS:", data);
      // Set the CID to localStorage
      localStorage.setItem("Metadata", data.IpfsHash);
    } catch (error) {
      console.error("Error uploading to Pinata:", error);
    }
  };

  return (
    <div>
      <button
        id="metaDataButton"
        className="rounded-3xl bg-darkslategray py-2 m-4 px-s text-left text-white hidden"
        onClick={handleUpload}
      >
        Upload to IPFS
      </button>
    </div>
  );
};

export default UploadMetadata;
