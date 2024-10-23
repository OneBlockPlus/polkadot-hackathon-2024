
import { Abi, ContractPromise } from '@polkadot/api-contract'

import abiData from '../ink_contracts/target/ink/ytpurchase.json';


const CONTRACT_ADDRESS = 'bfu6bVbZ3HezegPEJFuHYssWAA5UxvoyQkiG1bNBrARmTpP'//smart contract deployed address 
	
export default async function getContract(api) {


    const abi = new Abi(abiData, api.registry.getChainProperties())

    const contract = new ContractPromise(api, abi, CONTRACT_ADDRESS)

	return contract
  }
  