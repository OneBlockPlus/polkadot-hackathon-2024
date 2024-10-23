import Dexie, { type Table } from "dexie";

const dbName = "KlessWallet DB";

export const settingsKeys = {
  isPopulated: "isPopulated",
  autoLockMinutes: "auto-lock-minutes",
};

export interface SerializedAccount {
  readonly id: string;
  readonly type: "zkLogin";
  readonly address: string;
  readonly salt: string;

  readonly addressSeed: string | null;
  readonly jwt: string;
  readonly epoch: string;
  readonly ephPrivateKey: string;
  readonly proof: any;
  readonly lastUnlockedOn: number | null;
  /**
   * indicates if it's the selected account in the UI (active account)
   */
  readonly selected: boolean;
  readonly expireMinutes: number;
  readonly nickname: string | null;
  readonly createdAt: number;
}

class DB extends Dexie {
  accounts!: Table<SerializedAccount, string>;
  transfer!: Table<
    {
      id: string;
      genesisHash: string;
      blockNumber: number;
      blockHash: string;
      from: string;
      to: string;
      value: number;
    },
    string
  >;
  lastHead!: Table<{ id: string; blockNumber: number }, string>;
  settings!: Table<{ setting: string; value: string }, string>;

  constructor() {
    super(dbName);
    this.version(1).stores({
      accounts: "id, type, address, salt",
      transfer: "id, genesisHash ,blockNumber, blockHash, from, to, value",
      lastHead: "id, blockNumber",
      settings: "setting",
    });
  }
}

async function init() {
  const db = new DB();
  if (!db.isOpen()) {
    await db.open();
  }
  return db;
}

let initPromise: ReturnType<typeof init> | null = null;

export const getDB = () => {
  if (!initPromise) {
    initPromise = init();
  }
  return initPromise;
};
