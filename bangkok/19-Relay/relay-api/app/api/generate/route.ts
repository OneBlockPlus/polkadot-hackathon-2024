import { connect } from "@/app/lib/db";
import Account from "@/app/lib/modals/account";
import { generateNewWallet, splitMnemonic } from "@/app/lib/web3/wallet";
import { NextRequest, NextResponse } from "next/server";

// The expected format of the requset is:
// For customer: https://<domain>/api/generate?type=customer?username=<username>?address=<SS58 Address>
// For merchant: https://<domain>/api/generate?type=merchant?username=<username>
export async function GET(req: NextRequest) {
  // 1. Extract the type query parameter
  const type = req.nextUrl.searchParams.get("type");

  // 2. Generate a new wallet
  const newWallet = await generateNewWallet();

  // 3. Split the mnomonic into 2 parts, store the first part into our database, return the second part for burning into user's RFID pin.
  const mnemonicParts = splitMnemonic(newWallet.mnemonic);

  // 4. Store the first part of the mnemonic into our database
  try {
    await connect();
    // 5. Check the type of the user
    if (type === "customer") {
      const account = new Account({
        // For customer accounts, the relayId is the SS58 address of their Polkadot wallet
        relayId: req.nextUrl.searchParams.get("address"),
        mnemonic: mnemonicParts.first,
        walletName: newWallet.address,
        userName: req.nextUrl.searchParams.get("username"),
        type: "customer",
      });

      await account.save();

      return new NextResponse(
        JSON.stringify({ mnemonic: mnemonicParts.second }),
        {
          status: 200,
        }
      );
    } else if (type === "merchant") {
      const account = new Account({
        // For merchant accounts, the relayId is the same as their wallet name
        relayId: newWallet.address,
        mnemonic: mnemonicParts.first,
        walletName: newWallet.address,
        userName: req.nextUrl.searchParams.get("username"),
        type: "merchant",
      });

      await account.save();

      return new NextResponse(
        JSON.stringify({ mnemonic: mnemonicParts.second }),
        {
          status: 200,
        }
      );
    } else {
      return new NextResponse(
        JSON.stringify({ message: "Invalid account type" }),
        {
          status: 400,
        }
      );
    }
  } catch (err: any) {
    return new NextResponse(JSON.stringify({ message: err.message }), {
      status: 500,
    });
  }
}
