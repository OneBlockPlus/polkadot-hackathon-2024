// ApiContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ApiPromise, WsProvider } from "@polkadot/api";

interface ApiContextValue {
  api: ApiPromise | null;
  setApi: (api: ApiPromise | null) => void;
}

const ApiContext = createContext<ApiContextValue>({
  api: null,
  setApi: () => {},
});

export const useApi = () => {
  return useContext(ApiContext);
};

interface ApiProviderProps {
  children: ReactNode;
}

export const ApiProvider = ({ children }: ApiProviderProps): JSX.Element => {
  const [api, setApi] = useState<ApiPromise | null>(null);

  useEffect(() => {
    const connect = async () => {
      const provider = new WsProvider("wss://rpc.polkadot.io");
      const api = await ApiPromise.create({ provider });
      setApi(api);
    };
    connect();
  }, []);

  const value: ApiContextValue = { api, setApi };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};
