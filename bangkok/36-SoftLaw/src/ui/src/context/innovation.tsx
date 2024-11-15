import React, { createContext, useContext, useState, ReactNode } from "react";

//// COLLECTIONS INTERFACES ////
interface CollectionType {
  name: string;
  description: string;
  prefix: string;
  image: string;
}

interface collectionMetadataType {
  name: string;
  description: String;
  prefix: string;
  type: string;
  image: string;
}

///// NFTS INTERFACES/////

interface NftType {
  name: string;
  description: string;
  metadata: string;
}

interface nftMetadataType {
  name: string;
  technicalName: string;
  description: string;
  type: string;
  useDate: string;
  registryNumber: string;
  collectionId: number;
  image: string[];
}

// Chain Type
type ChainType = "unique" | "softlaw";

///GENERAL INTERFACES////
interface InnovationContextType {
  selectedTabInnovation: string;
  setSelectedTabInnovation: React.Dispatch<React.SetStateAction<string>>;
  collection: CollectionType | null;
  setCollection: React.Dispatch<React.SetStateAction<CollectionType | null>>;
  nft: NftType | null;
  setNft: React.Dispatch<React.SetStateAction<NftType | null>>;
  nftMetadata: nftMetadataType;
  setNftMetadata: React.Dispatch<React.SetStateAction<nftMetadataType>>;
  collectionMetadata: collectionMetadataType;
  setCollectionMetadata: React.Dispatch<
    React.SetStateAction<collectionMetadataType>
  >;
  metadataHash: string;
  setMetadataHash: React.Dispatch<React.SetStateAction<string>>;
  ipfsHashes: string | null;
  setIpfsHashes: React.Dispatch<React.SetStateAction<string | null>>;
  imageHash: string | null;
  setImageHash: React.Dispatch<React.SetStateAction<string | null>>;
  imagesLinks: string[];
  setImagesLinks: React.Dispatch<React.SetStateAction<string[]>>;
  //Unique Network
  uniqueCollectionAddress: string;
  setUniqueCollectionAddress: React.Dispatch<React.SetStateAction<string>>;
  // Loading
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  chain: ChainType;
  setChain: React.Dispatch<React.SetStateAction<ChainType>>;
  nftMetadataUrl: string | null;
  setNftMetadataUrl: React.Dispatch<React.SetStateAction<string|null>>;
}

/// DEFAULT VALUES////
const defaultContextValue: InnovationContextType = {
  selectedTabInnovation: "1",
  setSelectedTabInnovation: () => {},
  collection: null,
  setCollection: () => {},
  nft: null,
  setNft: () => {},
  nftMetadata: {
    name: "",
    technicalName: "",
    description: "",
    type: "",
    useDate: "",
    registryNumber: "",
    collectionId: 0,
    image: [],
  },
  setNftMetadata: () => {},
  nftMetadataUrl: null,
  setNftMetadataUrl: () => {},

  collectionMetadata: {
    name: "",
    description: "",
    prefix: "",
    type: "",
    image: "",
  },
  setCollectionMetadata: () => {},
  metadataHash: "",
  setMetadataHash: () => {},
  ipfsHashes: null,
  setIpfsHashes: () => {},
  imageHash: null,
  setImageHash: () => {},
  imagesLinks: [],
  setImagesLinks: () => {},
  // Unique Network
  uniqueCollectionAddress: "",
  setUniqueCollectionAddress: () => {},
  //loading
  loading: false,
  setLoading: () => {},
  //chain select
  chain: "softlaw",
  setChain: () => {},
};

const InnovationContext =
  createContext<InnovationContextType>(defaultContextValue);

export function useInnovationContext() {
  const context = useContext(InnovationContext);
  if (context === undefined) {
    throw new Error(
      "useInnovationContext must be used within an InnovationProvider"
    );
  }
  return context;
}

interface InnovationProviderProps {
  children: ReactNode;
}

export default function InnovationProvider({
  children,
}: InnovationProviderProps) {
  // TAB HEADER STATES
  const [selectedTabInnovation, setSelectedTabInnovation] =
    useState<string>("1");

  /// COLLECTION STATES
  const [collection, setCollection] = useState<CollectionType | null>(null);

  /// NFT STATES
  const [nft, setNft] = useState<NftType | null>({
    name: "",
    description: "",
    metadata: "",
  });

  const [collectionMetadata, setCollectionMetadata] =
    useState<collectionMetadataType>({
      name: "",
      description: "",
      prefix: "",
      type: "",
      image: "",
    });

  /// IPFS STATES
  const [metadataHash, setMetadataHash] = useState<string>("");
  const [nftMetadata, setNftMetadata] = useState<nftMetadataType>({
    name: "",
    technicalName: "",
    description: "",
    type: "",
    useDate: "",
    registryNumber: "",
    collectionId: 0,
    image: [],
  });
  const [ipfsHashes, setIpfsHashes] = useState<string | null>(null);
  const [imageHash, setImageHash] = useState<string | null>(null);
  const [imagesLinks, setImagesLinks] = useState<string[]>([]);

  //// UNIQUE NETWORK STATES
  const [uniqueCollectionAddress, setUniqueCollectionAddress] =
    useState<string>("");

  //// loading
  const [loading, setLoading] = useState<boolean>(false);

  //// Chain State
  const [chain, setChain] = useState<ChainType>("softlaw");

  /// ipfs nft final before mint
  const [nftMetadataUrl, setNftMetadataUrl] = useState<string|null>(null);

  const value: InnovationContextType = {
    selectedTabInnovation,
    setSelectedTabInnovation,
    collection,
    setCollection,
    nft,
    setNft,
    nftMetadata,
    setNftMetadata,
    collectionMetadata,
    setCollectionMetadata,
    metadataHash,
    setMetadataHash,
    ipfsHashes,
    setIpfsHashes,
    imageHash,
    setImageHash,
    imagesLinks,
    setImagesLinks,
    uniqueCollectionAddress,
    setUniqueCollectionAddress,
    loading,
    setLoading,
    chain,
    setChain,
    nftMetadataUrl, setNftMetadataUrl
  };

  return (
    <InnovationContext.Provider value={value}>
      {children}
    </InnovationContext.Provider>
  );
}
