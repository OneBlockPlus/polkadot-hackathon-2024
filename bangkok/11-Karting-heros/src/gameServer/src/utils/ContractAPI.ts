import fs from "fs";

import { initPolkadotJs } from "./init";
import { ContractPromise } from "@polkadot/api-contract";
import { ApiPromise } from "@polkadot/api";
import { getDeploymentContract } from "./getDeployment";
import path from "path";
import { contractQuery, contractTx } from "./contractCall";
type IKeyringPair = any;

export class ContractAPI {
  private contract: ContractPromise | null = null;
  private alice: IKeyringPair | null = null;
  private bob: IKeyringPair | null = null;
  private pair: IKeyringPair | null = null;
  private api: ApiPromise | null = null;

  constructor() {}

  async init() {
    const filePath = path.resolve(process.cwd(), "src/utils/GameScore.json");

    const CONTRACT_METADATA = fs.readFileSync(filePath, "utf8");
    const chainId = "contracts";
    const accountUri = "//Alice";
    const {
      api,
      keyring,
      account: alice,
    } = await initPolkadotJs(chainId, accountUri);

    this.api = api;
    this.bob = keyring.addFromUri("//Bob");
    this.alice = alice;

    const MNEMONIC =
      "fine undo assault symbol achieve emerge shed half mystery metal describe shop";
    this.pair = keyring.createFromUri(MNEMONIC);
    const getDeployments = [
      {
        contractId: "kartingGame",
        networkId: "contracts",
        abi: CONTRACT_METADATA,
        address: "5GD5pCToQ8Z1AqXoko7zEqCXEjmGd9wW5VEZj31NV2SCYVo7",
      },
    ];

    const contract = getDeploymentContract(
      api,
      getDeployments,
      "kartingGame",
      chainId
    );
    this.contract = contract!;
  }

  async updateScore(roomId: string, player: string, score: number) {
    if (this.api && this.pair && this.contract) {
  
      try {
        const { result } = await contractTx(
          this.api,
          this.pair,
          this.contract,
          "updateScore",
          {},
          [roomId, player, score]
        );
        if (result) {
          console.log("Success", result.toHuman());
        } else {
          console.error("Error", result);
        }
      } catch (e) {
        console.log(e);
      }
    }
  }

  async getRoomScore(roomId: string) {
    if (this.api && this.alice && this.pair && this.contract) {
      const { gasRequired, storageDeposit, result, output } =
        await contractQuery(
          this.api,
          this.alice.address,
          this.contract,
          "getRoomScore",
          {},
          [roomId]
        );
      console.log("a", result.toHuman());
      if (result.isOk) {
        console.log("Success", output?.toHuman());
      } else {
        console.error("Error", result.asErr);
      }
    }
  }
}
