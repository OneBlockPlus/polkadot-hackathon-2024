
import { Abi, ContractPromise } from '@polkadot/api-contract'

import abiData from '../../contracts/ink_contracts/target/ink/polkagift.json';
import config from '../json/config.json';

const CONTRACT_ADDRESS = config.AstarSmartContract //smart contract deployed address 
	
export default async function getContract(api) {


    // const abi = new Abi(abiData, api.registry.getChainProperties())

    // const contract = new ContractPromise(api, abi, CONTRACT_ADDRESS)

	// return contract
  return null
  }
  