
import React, { useState, useEffect } from 'react';
import {BidNFT} from '../../../services/api/useContractApi';


export default async function handler(req, res) {
  //Variables
  let tokenId = (req.query.id)
  let privatekey = req.body.privatekey
  let Mnemonic = req.body.mnemonic
  let biddingPrice = req.body.BidPrice
  
   let output = await BidNFT(tokenId,biddingPrice,privatekey,Mnemonic)
  res.status(200).json(JSON.stringify(output))
}


// Sample Data
// {
//   "id": m_0,
//   "privatekey": "aabb7f566f8f7c2d9f6ca79c45a160d6f015cccca8d29fbb367d78c7e0111113",
//   "mnemonic": "aabb7f566f8f7c2d9f6ca79c45a160d6f015cccca8d29fbb367d78c7e0111113",
//   "BidPrice": 0.05
// }