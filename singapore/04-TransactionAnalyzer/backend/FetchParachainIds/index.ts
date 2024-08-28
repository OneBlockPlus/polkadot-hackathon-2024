import { WsProvider, ApiPromise } from "@polkadot/api"
import * as fs from 'fs'
import { response } from "express"


// Define the interface for the chain object
interface Chain {
    name: string;
    websocket: string;
  }
  
  // Define the interface for the original JSON structure
  interface OriginalJson {
    chains: Chain[];
  }

  interface NewJson {
    chains: Chain[];
  }

  interface ParaLocation {
    id: number;
    relay: string;
  }

async function generatePrachainIdsJson() {
    const chainsResponse = await fetch('https://raw.githubusercontent.com/RostislavLitovkin/PlutoWallet/devel/chains.json')
    const chains: OriginalJson = await chainsResponse.json()
    console.log(chains)    
    const chainDictionary: Record<string, Record<number, Chain>> = {}

    chainDictionary['polkadot'] = {}
    for (let i = 0; i < chains.chains.length; i++){
        try {

        const chain = chains.chains[i]

        console.log(chain.name)
        const provider = new WsProvider(chain.websocket); // Replace with the correct endpoint for your network
        const api = await ApiPromise.create({ provider });

        if (api.query.parachainInfo) {
            const paraId: any = await api.query.parachainInfo.parachainId()

            console.log(paraId.toHuman())
            if (paraId !== null) {
                console.log("Writing!" + paraId)
                chainDictionary['polkadot'][paraId] = chain
            }
        }
        } catch(e) {
            console.log(e)
        }
    }
    console.log(chainDictionary)

    // save to json
    // Convert the dictionary to JSON string
    const jsonString = JSON.stringify(chainDictionary, null, 2);

    // Define the file path
    const filePath = '../src/chains.json';

    // Write JSON string to the file
    fs.writeFile(filePath, jsonString, 'utf8', (err) => {
    if (err) {
        console.error('Error writing file:', err);
    } else {
        console.log('File successfully written to', filePath);
    }
    });
}

generatePrachainIdsJson()
console.log("Hello")