export interface UserData {
  address: string;
  chain: string;
  tg?: string;
  x?: string;
  email?: string;
}

export interface UserRO {
  user: UserData;
}