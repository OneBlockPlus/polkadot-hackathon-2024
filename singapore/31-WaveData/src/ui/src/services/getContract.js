
import { Abi, ContractPromise } from '@polkadot/api-contract'

import abiData from '../ink_contracts/wavedata/target/ink/wavedata.json';


const CONTRACT_ADDRESS = 'WtrZb7krkFMHiQSsPjUJ8ReFaAkyoKe5TiKroGdURe2A26d'//smart contract deployed address 
	
export default async function getContract(api) {


    const abi = new Abi(abiData, api.registry.getChainProperties())

    const contract = new ContractPromise(api, abi, CONTRACT_ADDRESS)

	return contract
  }
  