import { Abi, ContractPromise } from '@polkadot/api-contract'
import abiData from './ink_contracts/wavedata.json';


const address = 'YTouh9sbh2QbNX882au7uC1otmsFGQFWi25jC4uEya9KiLe'//smart contract deployed address 
	
export default async function getContract(api) {


    const abi = new Abi(abiData, api.registry.getChainProperties())

    const contract = new ContractPromise(api, abi, address)

	return contract
  }
  