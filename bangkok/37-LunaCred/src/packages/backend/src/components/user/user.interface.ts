export interface IUser {
  _id: string;
  address: string;
  twitterId: string;
  signature: string;
  approved?: boolean;
  twitterUserName?: string;
  airdropAmount?: string;
}

export interface IUpdateUser {
  twitterId?: string;
  approved?: boolean;
}
