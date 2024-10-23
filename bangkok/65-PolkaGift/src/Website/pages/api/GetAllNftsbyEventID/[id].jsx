
import React, { useState, useEffect } from 'react';
import usContract from '../../../services/api/useContractApi';

export default async function handler(req, res) {
  const contract = await usContract("");
  let id = Number(req.query.id)
  let output = null;
  async function fetchContractData() {
    if (contract) {
      const arr = [];
      const totalTokens = await contract.gettokenSearchEventTotal(id);
      for (let i = 0; i < Number(10); i++) {
        const obj = await totalTokens[i];

        let object = {};
        try { object = await JSON.parse(obj) } catch { }
        if (object.title) {
          const TokenId = Number(await contract.gettokenIdByUri(obj));

          console.log(TokenId);
          arr.push({
            Id: TokenId,
            name: object.properties.name.description,
            description: object.properties.description.description,
            price: Number(object.properties.price.description),
            type: object.properties.typeimg.description,
            image: object.properties.image.description,
          });
        }

      }

      output = JSON.stringify(arr);
    }
  }

  await fetchContractData();

  res.status(200).json(output)
}