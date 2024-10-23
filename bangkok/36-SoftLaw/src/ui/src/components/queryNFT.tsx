import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

export default async function QueryNft() {
  const [nftData, setNftData] = useState({
    name: "hello",
    description: "",
    image: "image",
    fillingDate: "filling Date",
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const queryNFT = async () => {
    try {
    } catch (e) {
      toast({
        title: "Query Error",
        description: `Failed in query NFT}`,
        variant: "destructive",
      });
    }
  };

  // Using useEffect to call the async function
//   useEffect(() => {
//     const fetchNftData = async () => {
//       try {
       
//         const response = await fetch("https://api.example.com/nfts"); // Example API endpoint
//         if (!response.ok) {
//           throw new Error("Failed to fetch NFT data");
//         }
//         const data = await response.json();
//         setNftData(data);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchNftData();
//   }, []); 

  return (
    <div>
      {/* Render your NFT data here */}
      <h1>NFT Data</h1>
      <pre>{JSON.stringify(nftData, null, 2)}</pre>
    </div>
  );
}
