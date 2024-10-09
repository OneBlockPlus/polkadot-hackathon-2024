
import Image from "next/image";
import { Tabs } from "@/components/ui/tabs";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/check-box";

const nftData = [
  {
    category: "Art",
    items: [
      {
        id: 1,
        title: "Digital Sunrise",
        imageUrl: "https://via.placeholder.com/150",
        description: "A beautiful digital sunrise artwork.",
        creator: "Artist A",
        price: "0.5 ETH",
      },
      {
        id: 2,
        title: "Abstract Dream",
        imageUrl: "https://via.placeholder.com/150",
        description: "An abstract piece that captures the essence of dreams.",
        creator: "Artist B",
        price: "1.2 ETH",
      },
      {
        id: 3,
        title: "Ocean Waves",
        imageUrl: "https://via.placeholder.com/150",
        description: "A stunning representation of ocean waves.",
        creator: "Artist C",
        price: "0.8 ETH",
      },
    ],
  },
  {
    category: "Collectibles",
    items: [
      {
        id: 4,
        title: "Rare Coin",
        imageUrl: "https://via.placeholder.com/150",
        description: "A rare collectible coin with historical significance.",
        creator: "Collector A",
        price: "2.0 ETH",
      },
      {
        id: 5,
        title: "Vintage Stamp",
        imageUrl: "https://via.placeholder.com/150",
        description: "A vintage stamp from the early 20th century.",
        creator: "Collector B",
        price: "1.5 ETH",
      },
      {
        id: 6,
        title: "Antique Toy",
        imageUrl: "https://via.placeholder.com/150",
        description: "An antique toy that brings nostalgia.",
        creator: "Collector C",
        price: "3.0 ETH",
      },
    ],
  },
];

const Browsing = () => {
  const tabs = [
    {
      title: "All",
      value: "All",
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* 遍历所有类别下的 NFT */}
          {nftData.flatMap((category) =>
            category.items.map((item) => (
              <DummyContent key={item.id} {...item} />
            ))
          )}
        </div>
      ),
    },
    {
      title: "Art",
      value: "Art",
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* 遍历 Art 类别下的 NFT */}
          {nftData
            .find((category) => category.category === "Art")
            ?.items.map((item) => (
              <DummyContent key={item.id} {...item} />
            ))}
        </div>
      ),
    },
    {
      title: "Collectibles",
      value: "Collectibles",
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* 遍历 Art 类别下的 NFT */}
          {nftData
            .find((category) => category.category === "Collectibles")
            ?.items.map((item) => (
              <DummyContent key={item.id} {...item} />
            ))}
        </div>
      ),
    },
  ];
  return (
    <main className="relative bg-black-100 flex justify-center items-center flex-col overflow-hidden sm:px-10 px-5">
      <Header />

      <div className="max-w-[80%] w-full">
        <div className="h-[20rem] md:h-[40rem] [perspective:1000px] relative b flex flex-col max-w-5xl mx-auto w-full  items-start justify-start my-40">
          <div className="w-15 absolute right-0 z-20 custom-top flex max-w-sm items-center space-x-2 ">
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Own
              </label>
            </div>
            <Input />
            <button className="px-4 py-2 rounded-md border border-white-300 uppercase bg-white text-black text- hover:-translate-y-1 transform transition duration-200 hover:shadow-md">
              Search
            </button>
          </div>

          <Tabs tabs={tabs} />
        </div>
      </div>
    </main>
  );
};

export default Browsing;

// 定义 DummyContent 组件的 props 类型
type DummyContentProps = {
  title: string;
  creator: string;
  price: string; // 价格可以是字符串或数字，取决于你的需求
};
const DummyContent: React.FC<DummyContentProps> = ({
  title,
  creator,
  price,
}) => {
  return (
    <div className="cursor-pointer bg-white shadow-md rounded-t-lg rounded-b-md p-4 w-full max-w-sm mx-auto">
      {/* Image Placeholder */}
      <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
        <Image
          src="/linear.webp"
          alt="dummy image"
          width={100}
          height={100}
          className="h-full w-full object-cover rounded-t-lg"
        />
      </div>
      {/* NFT Info */}
      <div className="mt-4 text-center">
        <h3 className="text-xl text-black-100 font-semibold">{title}</h3>
        <p className="text-sm text-gray-500">{creator}</p>
        <p className="text-lg font-bold text-pink-500 mt-2">{price}</p>
      </div>
    </div>
  );
};
