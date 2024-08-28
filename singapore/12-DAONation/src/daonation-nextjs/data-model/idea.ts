export interface Idea {
  ideasId: string;
  goalId: string;
  Title: string;
  Description: string;
  wallet: string;
  recieve_wallet: string;
  recievetype?: string;
  user_id: number;
  logo?: string;
  allfiles: unknown;
  Referenda?: number;
  donation: number;
  votes: number;
  isVoted?:boolean;
  isOwner?:boolean;
}
