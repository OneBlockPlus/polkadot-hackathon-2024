//@ts-nocheck


"use client"

import React from 'react'
import { Button } from './ui/button';
import { decodeAddress } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';
export default function TestComp() {

  function computeMultilocation(address, isEVM = false) {
    if (isEVM) {
      // For 20-byte EVM address (Ethereum)
      return {
        parents: 1, // Adjust accordingly based on the chain hierarchy
        interior: {
          X1: {
            AccountKey20: {
              key: address,  // Ensure it's a 20-byte EVM address
              network: 'Any'
            }
          }
        }
      };
    } else {
      // For 32-byte Substrate address (Polkadot/Kusama format)
      return {
        parents: 1, // Adjust accordingly based on the chain hierarchy
        interior: {
          X1: {
            AccountId32: {
              id: address,  // Ensure it's a 32-byte Substrate address
              network: 'Any'
            }
          }
        }
      };
    }
  }

  const computeAddress = ()  =>  {
    const substrateAddress = '14aydZmckPPwBWLrmCmnMwraodUv3iveuYQoAQeajZpHGN7A';
const multilocationSubstrate = computeMultilocation(substrateAddress, false);
console.log(multilocationSubstrate);
  }

  function destinationAddressToHex(substrateAddress) {
    // Decode the SS58 Substrate address into a byte array (u8a)
    const decodedAddress = decodeAddress(substrateAddress);

    // Convert the byte array into a hex string
    const hexAddress = u8aToHex(decodedAddress);

    return hexAddress;
}

function getMultilocation(destinationAddress, parents) {
    let interior = [];

    // Check if the destination is Substrate (32-byte address)
    if (destinationAddress.length === 48) {
        // AccountId32: 32-byte Substrate address
        let accountIdHex = destinationAddressToHex(destinationAddress); // convert Substrate address to hex
        interior = [`0x01${accountIdHex.slice(2)}00`]; // '00' for Network Null
    // Check if the destination is an Ethereum-like (20-byte address)
    } else if (destinationAddress.length === 42) {
        // AccountKey20: 20-byte Ethereum address
        let ethAddress = destinationAddress.toLowerCase().replace('0x', ''); // clean Ethereum address
        interior = [`0x03${ethAddress}00`]; // '00' for Network Null
    } else {
        throw new Error('Unsupported address format.');
    }

    return {
        parents: parents,   // The number of hops in the relay chain (e.g., 1 for parachains)
        interior: interior  // The interior structure with the appropriate account format
    };
}


const  showAddressses =  async  ()  =>  {
  // Example usage:
try {
  const substrateAddress = '0x9AE631b1a21b755428e01d8f0979554a4e4C8305'; // Replace with your Substrate address
  const parents = 1; // Replace with the number of parents
  const multilocation = getMultilocation(substrateAddress, parents);
  console.log('Multilocation:', multilocation);
} catch (error) {
  console.error('Error:', error.message);
}
}

function decodeSubstrateAddress(substrateAddress) {
  try {
      // Decode the SS58 Substrate address into a byte array (u8a)
      const decodedAddress = decodeAddress(substrateAddress);

      // Return the decoded address in hex format
      return {
          success: true,
          decoded: decodedAddress
      };
  } catch (error) {
      // Handle the error if the address is invalid
      return {
          success: false,
          error: error.message
      };
  }}

  const decodeAddress =  async ()  =>  {
    // Example usage
  const substrateAddress = '0x019e9e6f08b1075ba79bb78848d3c351c9c1cb76c1863f47b3e29023174c6a765100';
  const result = decodeSubstrateAddress(substrateAddress);
  
  if (result.success) {
      console.log('Decoded Address (u8a):', result.decoded);
  } else {
      console.error('Error decoding address:', result.error);
  }
  }



 
  return (
    <div>
      hello test

      <Button onClick={() => showAddressses()}>Compute</Button>
      <Button onClick={() => decodeAddress()}>decode address</Button>
    </div>
  )
}
