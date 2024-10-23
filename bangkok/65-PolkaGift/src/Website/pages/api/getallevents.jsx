
import React, { useState, useEffect } from 'react';
import usContract from '../../services/api/useContractApi';

export default async function handler(req, res) {
  const  contract  = await usContract("");

  let output = null;
  async function fetchContractData() {
    if (contract) {
      let totalEvent =Number( await contract.totalEvent());
      const arr = [];
      for (let i = 0; i < Number(totalEvent); i++) {
          
        const valueAll = await contract.eventURI(i);
        const value = valueAll[1];

          if (value) {
              const object = JSON.parse(value);
              var c = new Date(object.properties.Date.description).getTime();
              var n = new Date().getTime();
              var d = c - n;
              var s = Math.floor((d % (1000 * 60)) / 1000);
              if (s.toString().includes("-")) {
                  continue;
              }


              arr.push({
                  eventId: i,
                  Title: object.properties.Title.description,
                  Date: object.properties.Date.description,
                  Goal: object.properties.Goal.description,
                  logo: object.properties.logo.description,
                  allfiles: object.properties.allFiles
              });
          }         
      }
      output = JSON.stringify(arr);
    }
  }

 await fetchContractData();

  res.status(200).json(output)
}