
import React, { useState, useEffect } from 'react';
import usContract from '../../../services/api/useContractApi';
import PolkaGift from '../../../contracts/contract/deployments/moonbeam/PolkaGift.json'
import BatchABI from '../../../contracts/contract/artifacts/contracts/precompiles/Batch.sol/Batch.json'
import  {ethers} from 'ethers';
import config  from '../../../services/json/config.json'

export default async function handler(req, res) {
  //Variables
  let tokenId = Number(req.query.id)
  let privatekey = req.body.privatekey
  let biddingPrice = req.body.BidPrice

  const contract = await usContract(privatekey);
  let output = null;
  


  async function BidNft() {
    try {

      let to = [];
      let value = [];
      let callData = [];
      let gasLimit = [];

      const provider = new ethers.providers.JsonRpcProvider(config.jsonRPC)

      const targetSigner = new ethers.Wallet(privatekey, provider);
      let senderAddress = await targetSigner.getAddress();
      
      const tokenUri = await contract.tokenURI(tokenId);
      var parsed = await JSON.parse(tokenUri);
      let eventId = Number(parsed.properties.eventID);


      //Transfer
      if (biddingPrice < Number(parsed.properties.price.description)) {
        output = JSON.stringify({
          status: "error",
          message: `The bid price is lower than ${parsed.properties.price.description}!`
        })
        console.log(output);
        return;
      }

      //Adding Sending amount to Batch paramaters:

      to.push(parsed.properties.wallet.description);
      value.push(`${Number(biddingPrice) * 1e18}`)
      callData.push("0x");


      // Adding creating bid information:

      if (Number(parsed['properties']['price']['description']) < Number(biddingPrice)) {
        parsed['properties']['price']['description'] = Number(biddingPrice);
        parsed['properties']['higherbidadd']['description'] = senderAddress;

      }
    

        let currentDate = new Date();
        const createdObject = {
          title: 'Asset Metadata Bids',
          type: 'object',
          properties: {
            username: {
              type: 'string',
              description: senderAddress
            },
            bid: {
              type: 'string',
              description: biddingPrice
            },
            time: {
              type: 'string',
              description: currentDate
            }
          }
        };
      const totalraised = await contract.getEventRaised(Number(eventId));
      let Raised = 0;
      Raised = Number(totalraised) + Number(biddingPrice);

      to.push(PolkaGift.address);
      value.push(0);
      callData.push((await contract.populateTransaction.createBid(tokenId, JSON.stringify(createdObject), JSON.stringify(parsed), eventId, Raised.toString())).data)

      let batchAdd = "0x0000000000000000000000000000000000000808";

      let BatchContract = new ethers.Contract(batchAdd, BatchABI.abi, targetSigner);

      await (await BatchContract.batchAll(to, value, callData, gasLimit)).wait(1);

      output = JSON.stringify({
        status: "success",
        message: `Bid successful`
      })
    } catch (error) {
      output = {
        status: "error",
        from: "Full Error",
        message: error.message,

      };
    }
  }
  await BidNft();

  res.status(200).json(output)
}


// Sample Data
// {
//   "id": 0,
//   "privatekey": "aabb7f566f8f7c2d9f6ca79c45a160d6f015cccca8d29fbb367d78c7e0111113",
//   "BidPrice": 0.05
// }