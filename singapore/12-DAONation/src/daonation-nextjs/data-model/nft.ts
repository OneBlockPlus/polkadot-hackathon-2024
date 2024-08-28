export interface Bid {
  id?:number,
  nftId?:number,
  eventId?:number,
  daoId?:number,
  
  date: string;
  bidder: string;
  bidderUserId: number;
  walletAddress: string;
  bidAmount: number;
  
}

export interface NFT {
  id: number;
  daoid?: number;
  eventid?: number;
  name: string;
  url: string;
  description: string;
  owner?:number;
  highest_amount?: number;
  highest_bidder?: string;
  highest_bidder_userid?: number;
  highest_bidder_wallet?: string;
  highestBid: Bid;
  bidHistory: Bid[];
}
