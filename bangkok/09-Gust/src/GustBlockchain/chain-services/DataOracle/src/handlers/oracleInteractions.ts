import { Request, Response } from "express";

const blockchain:any = {
  wallets: {
    "0x1234abcd5678ef90": { GUS: 10, USDC: 2000 },
    "0x5678abcd1234ef90": { GUS: 5, USDC: 1500 }
  },
  tokenPrices: {
    GUS: 1800.50,
    USDC: 1.00
  }
};

export const swap = async(req: Request, res: Response) : Promise<any> => {
  const { fromToken, toToken, amount, fromWallet, toWallet } = req.body;

  if (!blockchain.wallets[fromWallet] || !blockchain.wallets[toWallet]) {
    return res.status(400).json({
    success: false,
    error: "Wallet not found"
    });
  }

  const fromBalance = blockchain.wallets[fromWallet][fromToken];
  const toPrice = blockchain.tokenPrices[toToken];
  const fromPrice = blockchain.tokenPrices[fromToken];
  
  if (!fromBalance || !toPrice || !fromPrice) {
      return res.status(400).json({
      success: false,
      error: "Invalid token symbol"
    });
  }

  const toAmount = (amount * fromPrice) / toPrice;

  if (fromBalance >= amount) {
    blockchain.wallets[fromWallet][fromToken] -= amount;
    blockchain.wallets[toWallet][toToken] += toAmount;

    return res.json({
      success: true,
      message: `Swapped ${amount} ${fromToken} to ${toAmount} ${toToken}`,
      swappedAmount: toAmount
    });
  } else {
     return res.status(400).json({
      success: false,
      error: "Insufficient funds"
    });
  }
};

export const transfer = async (req: Request, res: Response) : Promise<any>=> {
  const { token, amount, fromWallet, toWallet } = req.body;

  if (!blockchain.wallets[fromWallet] || !blockchain.wallets[toWallet]) {
    return res.status(400).json({
      success: false,
      error: "Wallet not found"
    });
  }

  const fromBalance = blockchain.wallets[fromWallet][token];

  if (fromBalance === undefined) {
    return res.status(400).json({
      success: false,
      error: "Invalid token symbol"
    });
  }

  if (fromBalance >= amount) {
    blockchain.wallets[fromWallet][token] -= amount;
    blockchain.wallets[toWallet][token] += amount;

    return res.json({
      success: true,
      message: `Transferred ${amount} ${token} from ${fromWallet} to ${toWallet}`,
      transferredAmount: amount
    });
  } else {
    return res.status(400).json({
      success: false,
      error: "Insufficient funds"
    });
  }
};
export const tokenPrice = async (req: Request, res: Response): Promise<any> => {
    const { token } = req.body;
  
    if (blockchain.tokenPrices[token]) {
      return res.status(200).json({
        success: true,
        token: token,
        price: blockchain.tokenPrices[token]
      });
    } else {
      return res.status(404).json({
        success: false,
        error: `Price for token ${token} not found`
      });
    }
  };