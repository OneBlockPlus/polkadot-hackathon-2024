import { Abi, ContractPromise } from '@polkadot/api-contract'
import abiData from '../../../contracts/ink_contracts/target/ink/polkagift.json';
import config from '../../../contexts/json/config.json';


const address = config.AstarSmartContract //smart contract deployed address 
	
export default async function getContract(api) {


    const abi = new Abi(abiData, api.registry.getChainProperties())

    const contract = new ContractPromise(api, abi, address)

	return contract
  }
  