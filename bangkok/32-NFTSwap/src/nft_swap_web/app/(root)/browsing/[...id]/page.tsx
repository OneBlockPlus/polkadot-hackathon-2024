"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// 定义 NFT 数据的类型
interface NftData {
  id: string;
  name: string;
  price: string;
  image: string;
}

const NftDetailPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [nftData, setNftData] = useState<NftData | null>(null);
  // const { data } = router.query; // 'id' 是一个数组
  // const router = useRouter();
  // const { data } = router.query;

  useEffect(() => {
    
    // if (!data) {
    //   return <div>Loading...</div>;
    // } else {
    //   setNftData(JSON.parse(decodeURIComponent(data)));
    // }
  }, []);

  return (
    <div>
      <h1>NFT Details for ID:</h1>
      {/* <p>Name: {nftData.name}</p>
      <p>Price: {nftData.price}</p>
      <img src={nftData.image} alt={nftData.name} /> */}
    </div>
  );
};

export default NftDetailPage;
