import { ApiPromise, WsProvider } from "@polkadot/api";
import React, { createContext, useContext, useState, useEffect } from "react";

interface CarDetails {
  vehicleStatus: string;
  vehicleCondition: string;
  license: string;
  vin: string;
  country: string;
  model: string;
  make: string;
  interior: string;
  exterior: string;
  mileage: string;
  token: string;
  price: number;
  duration: string;
  selectedCurrencies: string[];
  message: string;
}

interface OwnerInfo {
  firstName: string;
  lastName: string;
  address: string;
  country: string;
  zipcode: string;
}

interface PolkaContextProps {
  selectedAccount: Object | null;
  api: ApiPromise | null;
  getApi: () => Promise<void>;
  ipfsHashes: string | null;
  handleIPFSHashes: (_value: string) => Promise<void>;
  selectedTabDashboard: number;
  setSelectedTabDashboard: React.Dispatch<React.SetStateAction<number>>;
  selectedTabAddmycar: number;
  setSelectedTabAddmycar: React.Dispatch<React.SetStateAction<number>>;
  selectedTabSteps: number;
  setSelectedTabSteps: React.Dispatch<React.SetStateAction<number>>;
  setSelectedAccount: React.Dispatch<React.SetStateAction<Object | null>>;
  nftNo: string | null;
  setNftNo: React.Dispatch<React.SetStateAction<string | null>>;
  metadata: string | null;
  setMetadata: React.Dispatch<React.SetStateAction<string | null>>;
  carDetails: CarDetails;
  setCarDetails: React.Dispatch<React.SetStateAction<CarDetails>>;
  ownerInfo: OwnerInfo;
  setOwnerInfo: React.Dispatch<React.SetStateAction<OwnerInfo>>;
  detailsHash: string | null;
  setDetailsHash: React.Dispatch<React.SetStateAction<string | null>>;
  imageHash: string | null;
  setImageHash: React.Dispatch<React.SetStateAction<string | null>>;
  imagesLinks: string[];
  setImagesLinks: React.Dispatch<React.SetStateAction<string[]>>;
  ownerInfoHash: string | null;
  setOwnerInfoHash: React.Dispatch<React.SetStateAction<string | null>>;
}

const PolkaContext = createContext<PolkaContextProps | undefined>(undefined);

export const usePolkaContext = () => {
  const context = useContext(PolkaContext);
  if (!context) {
    throw new Error("usePolkaContext must be used within a PolkaProvider");
  }
  return context;
};

export const PolkaProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedTabDashboard, setSelectedTabDashboard] = useState<number>(0);
  const [selectedTabAddmycar, setSelectedTabAddmycar] = useState<number>(0);
  const [selectedAccount, setSelectedAccount] = useState<Object | null>(null);
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [ipfsHashes, setIpfsHashes] = useState<string | null>(null);
  const [detailsHash, setDetailsHash] = useState<string | null>(null);
  const [nftNo, setNftNo] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<string | null>(null);
  const [imageHash, setImageHash] = useState<string | null>(null);
  const [imagesLinks, setImagesLinks] = useState<string[]>([]);
  const [ownerInfoHash, setOwnerInfoHash] = useState<string | null>(null);
  const [selectedTabSteps, setSelectedTabSteps] = useState<number >(0)

  // Define the initial state of carDetails
  const [carDetails, setCarDetails] = useState<CarDetails>({
    vehicleStatus: "",
    vehicleCondition: "",
    license: "",
    vin: "",
    country: "",
    model: "",
    make: "",
    interior: "",
    exterior: "",
    mileage: "",
    token: "",
    price: 0,
    duration: "",
    selectedCurrencies: [],
    message: "",
  });

  const [ownerInfo, setOwnerInfo] = useState<OwnerInfo>({
    firstName: "",
    lastName: "",
    address: "",
    country: "",
    zipcode: "",
  });

  const RPC_URL = "wss://fraa-flashbox-4424-rpc.a.stagenet.tanssi.network";

  const handleIPFSHashes = async (_value: string) => {
    setIpfsHashes(_value);
  };

  const getApi = async () => {
    if (!api) {
      const wsProvider = new WsProvider(RPC_URL);
      const PolkApi = await ApiPromise.create({ provider: wsProvider });
      setApi(PolkApi);
    }
  };

  useEffect(() => {
    getApi();
  }, []);

  return (
    <PolkaContext.Provider
      value={{
        selectedAccount,
        setSelectedAccount,
        api,
        getApi,
        selectedTabDashboard,
        setSelectedTabDashboard,
        selectedTabAddmycar,
        setSelectedTabAddmycar,
        ipfsHashes,
        handleIPFSHashes,
        nftNo,
        setNftNo,
        metadata,
        setMetadata,
        carDetails,
        setCarDetails,
        detailsHash,
        setDetailsHash,
        imageHash,
        setImageHash,
        imagesLinks,
        setImagesLinks,
        ownerInfo,
        setOwnerInfo,
        ownerInfoHash,
        setOwnerInfoHash,
        selectedTabSteps,
        setSelectedTabSteps
      }}
    >
      {children}
    </PolkaContext.Provider>
  );
};
