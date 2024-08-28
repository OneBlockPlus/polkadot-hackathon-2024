import { NFT } from './nft';

export interface JoinedLiveEvent {
  id: Number;
  userId: Number;
  eventId: Number;
  daoId: Number;
  date: String;
}

export interface CharityEvent {
  id: Number;
  eventId: Number;
  daoId: Number;
  Title: string;
  Description: string;
  Budget: number;
  eventStreamUrl?: string;
  ticketPrice?: number;
  End_Date: string;
  Time?: string;
  TimeFormat?: string;
  LiveStarted?: boolean;
  wallet: string;
  UserId: Number;
  logo: string;
  type: string;
  reached: number;
  amountOfNFTs: number;
  status: string;
  participantsCount?: 0;
  participants?: [];
  isOwner?:boolean,
  boughtTicket?:boolean;
  NFTS?: NFT[];
  eventType: 'livestream' | 'auction';
}
