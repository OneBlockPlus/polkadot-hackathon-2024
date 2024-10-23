import { getDB } from "@/background/db";

export const getAccounts = async () => {
  const db = await getDB();
  return db.accounts.toCollection().sortBy("createdAt");
};

export const getAccount = async (address: string) => {
  const accounts = await getAccounts();
  return accounts.find((account) => account.address === address);
};
