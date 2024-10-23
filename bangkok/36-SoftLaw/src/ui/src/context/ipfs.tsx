import { createContext, useContext, useState, ReactNode } from "react";

interface NftData {
  technicalName: string;
  technicalDescription: string;
  registrationNumber: string;
  fillingDate: string;
  commonName: string;
  commonDescription: string;
  internalNumber: string;
}

interface IpfsContextType {
  ipfsHashes: string | null;
  setIpfsHashes: React.Dispatch<React.SetStateAction<string | null>>;
  imageHash: string | null;
  setImageHash: React.Dispatch<React.SetStateAction<string | null>>;
  imagesLinks: string[];
  setImagesLinks: React.Dispatch<React.SetStateAction<string[]>>;
  nftData: NftData; 
  setNftData: React.Dispatch<React.SetStateAction<NftData>>; 
}

const defaultContextValue: IpfsContextType = {
  ipfsHashes: null,
  setIpfsHashes: () => {},
  imageHash: null,
  setImageHash: () => {},
  imagesLinks: [],
  setImagesLinks: () => {},
  nftData: {
    technicalName: "",
    technicalDescription: "",
    registrationNumber: "",
    fillingDate: "",
    commonName: "",
    commonDescription: "",
    internalNumber: "",
  },
  setNftData: () => {},
};

const IpfsContext = createContext<IpfsContextType>(defaultContextValue);

export function useIpfs() {
  const context = useContext(IpfsContext);
  if (context === undefined) {
    throw new Error("useIpfs must be used within an IpfsProvider");
  }
  return context;
}

interface IpfsProviderProps {
  children: ReactNode;
}

export default function IpfsProvider({ children }: IpfsProviderProps) {
  const [ipfsHashes, setIpfsHashes] = useState<string | null>(null);
  const [imageHash, setImageHash] = useState<string | null>(null);
  const [imagesLinks, setImagesLinks] = useState<string[]>([]);

  const [nftData, setNftData] = useState<NftData>({
    technicalName: "",
    technicalDescription: "",
    registrationNumber: "",
    fillingDate: "",
    commonName: "",
    commonDescription: "",
    internalNumber: "",
  });
  const value: IpfsContextType = {
    ipfsHashes,
    setIpfsHashes,
    imageHash,
    setImageHash,
    imagesLinks,
    setImagesLinks,
    nftData,    
    setNftData, 
  };

  return <IpfsContext.Provider value={value}>{children}</IpfsContext.Provider>;
}
