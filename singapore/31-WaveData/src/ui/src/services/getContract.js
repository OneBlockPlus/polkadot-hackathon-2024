
import { Abi, ContractPromise } from '@polkadot/api-contract'

import abiData from '../ink_contracts/wavedata/target/ink/wavedata.json';


const CONTRACT_ADDRESS = 'YPh92B2p659spnB4ASZqkiz8gFiwdDoT7g8gGWxkMXsUcgJ'//smart contract deployed address 
	
export default async function getContract(api) {


    const abi = new Abi(abiData, api.registry.getChainProperties())

    const contract = new ContractPromise(api, abi, CONTRACT_ADDRESS)

	return contract
  }
  