import { Schema, model, models } from "mongoose";

const AccountSchema = new Schema(
  {
    // For customer accounts, the relayId is the SS58 address of their Polkadot wallet
    // For merchant accounts, the relayId is the same as their wallet name
    relayId: { type: String, required: true, unique: true },
    // This is the wallet public key generated for the user and managed by relay
    walletName: { type: String, required: true, unique: true },
    // This is the human readable user name
    userName: { type: String, required: true, unique: true },
    // The type of the account, either "merchant" or "customer"
    type: { type: String, required: true },
    // The first 3 words of a mnemonic string
    mnemonic: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Account = models.Account || model("Account", AccountSchema);

export default Account;
