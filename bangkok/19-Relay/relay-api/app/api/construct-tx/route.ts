import { NextRequest, NextResponse } from "next/server";
import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import { connect } from "@/app/lib/db";
import Account from "@/app/lib/modals/account";

// The expected format of the requset is:
// https://<domain>/api/construct-tx
//
// The request body should contain the following fields:
// {
//  relayId: sender's relay ID,
//  mnemonicPart: sender's mnemonic part,
//  recipient: recipient's relay ID,
//  amount: amount to send,
// }
interface RequestBody {
  relayId: string;
  mnemonicPart: string;
  recipient: string;
  // 1 ROC = 1_000_000_000_000
  amount: number;
}

export async function POST(req: NextRequest) {
  const body: RequestBody = await req.json();
  // 1. Connect to the Rococo testnet using a WebSocket provider
  const provider = new WsProvider("wss://rococo-rpc.polkadot.io");
  const api = await ApiPromise.create({ provider });

  console.log("Connected to Rococo testnet.");

  // 2. Reconstruct the sender's account from the mnemonic part
  const keyring = new Keyring({ type: "sr25519" });
  const senderPartTwo = body.mnemonicPart.split("_");
  // Connect to db to retrieve the first part of the mnemonic
  await connect();
  const senderInfo = await Account.findOne({ relayId: body.relayId });
  // Reconstruct the mnemonic, the mnemonic parts are words separated by _.
  const senderPartOne = senderInfo.mnemonic.split("_");
  // Combine the two parts of the mnemonic
  const senderMnemonic = senderPartOne.concat(senderPartTwo).join(" ");

  const sender = keyring.addFromUri(senderMnemonic);
  const recipient = body.recipient;
  const amount = body.amount; 

  // 4. Create a balance transfer transaction
  const transfer = api.tx.balances.transferKeepAlive(recipient, amount);

  // 5. Sign and send the transaction
  console.log(`Sending ROC from ${sender.address} to ${recipient}...`);
  const unsub = await transfer.signAndSend(sender, ({ status, events }) => {
    if (status.isInBlock) {
      console.log(`Transaction included at blockHash: ${status.asInBlock}`);
    } else if (status.isFinalized) {
      console.log(`Transaction finalized at blockHash: ${status.asFinalized}`);

      // Log each event
      events.forEach(({ event: { method, section }, phase }) => {
        console.log(`\t${phase}: ${section}.${method}`);
      });

      // Unsubscribe once the transaction is finalized
      unsub();
    } else {
      console.log(`Transaction status: ${status.type}`);
    }
  });

  console.log("Transaction successfully sent to the Rococo network.");

  return new NextResponse(JSON.stringify({ msg: "Transaction sent" }), {
    status: 200,
  });
}
