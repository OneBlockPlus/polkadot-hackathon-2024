import BN from "bn.js";
import { tokenSymbol } from "./utils/networkConstants";
import { Poppins } from "next/font/google";

export const LISTING_LIMIT = 10;

export type ErrorBoundaryPageProps = { error: Error; reset: () => void };

export interface ICoin {
  createdAt: string;
  totalSupply: string;
  limit: string;
  title: string;
  content?: string;
  logoImage: string;
  name: string;
  mintCount: number;
  mintedByAddresses: string[];
  proposer: string;
  network: string;
  minted?: string;
}

export enum NotificationStatus {
  SUCCESS = "success",
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
}

export interface IFirebaseCoin {
  created_at: Date | string;
  content: string;
  title: string;
  limit: string;
  total_supply: string;
  logo_image: string;
  minted_addresses?: string[];
  name: string;
  proposer: string;
  network: string;
}

export const poppins = Poppins({
  adjustFontFallback: false,
  display: "swap",
  style: ["italic", "normal"],
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["200", "300", "400", "500", "600", "700"],
});

export const ZERO_BN = new BN(0);
export type TokenSymbol = (typeof tokenSymbol)[keyof typeof tokenSymbol];

export type TRPCEndpoint = {
  key: string;
  label: string;
};

export interface ChainProps {
  palletInstance?: string;
  parachain?: string;
  blockTime: number;
  logo?: Date | string;
  ss58Format: number;
  tokenDecimals: number;
  tokenSymbol: TokenSymbol;
  chainId: number;
  rpcEndpoint: string;
  category: string;
  externalLinks: string;
  assethubExternalLinks?: string;
  rpcEndpoints: TRPCEndpoint[];
  relayRpcEndpoints?: TRPCEndpoint[];
}

export type ServerComponentProps<T, U> = {
  params?: T;
  searchParams?: U;
};
