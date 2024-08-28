const { ethers } = require('ethers'); // Import ethers
const abi = require('./CrossChainBridge.json'); // ABI of the contract

// List of bridge contracts with their addresses, RPC URLs, and private keys
const bridgeConfigs = [
    { address: '0x01420dAE1cea60CB4E7c5808AD69712Da393e152', rpcUrl: 'http://127.0.0.1:9944', privateKey: 'fa5f9b12e5a4eb35fa64608db941b9f718c9cedaa12f8e69a9c44d2a5efb4785' },
    { address: '0xb02067DD74a44A465910a4792Db00a1C395412dF', rpcUrl: 'http://127.0.0.1:43279', privateKey: 'fa5f9b12e5a4eb35fa64608db941b9f718c9cedaa12f8e69a9c44d2a5efb4785' },
    // Add more bridges as needed
];

function writeMethodAbi(functionName, variableName) {
    return [
        `function ${functionName}(uint256[] calldata ${variableName}s, uint32[] calldata ${variableName}Versions) public`
    ];
}

function readValueMethodAbi(methodName) {
    return [
      `function ${methodName}() view returns (uint256)`
    ];
}

function readVersionMethodAbi(methodName) {
    return [
      `function ${methodName}Version() view returns (uint256)`
    ];
}

async function listenToBridgeEvents() {
    for (const config of bridgeConfigs) {
        const provider = new ethers.JsonRpcProvider(config.rpcUrl);
        const wallet = new ethers.Wallet(config.privateKey, provider); // Create wallet from private key
        const contract = new ethers.Contract(config.address, abi, wallet);

        try {
            contract.on('ReadValuesRequested', async (currentContractAddress, contractAddresses, rpcUrls, variableName, functionName) => {
                try {
                    // Reading the variable values from each contract
                    const values = [];
                    const valueVersions = [];
                    for (let i = 0; i < contractAddresses.length; i++) {
                        const rpcUrl = rpcUrls[i];
                        const address = contractAddresses[i];
                        const providerInstance = new ethers.JsonRpcProvider(rpcUrl);

                        const valueMethodAbi = readValueMethodAbi(variableName);
                        const versionMethodAbi = readVersionMethodAbi(variableName);

                        const contractInstance1 = new ethers.Contract(address, valueMethodAbi, providerInstance);
                        const contractInstance2 = new ethers.Contract(address, versionMethodAbi, providerInstance);

                        try {
                            const value = await contractInstance1[variableName]();
                            const valueVersion = await contractInstance2[variableName + "Version"]();
                            values.push(value);
                            valueVersions.push(valueVersion);
                        } catch (err) {
                            console.log(await contractInstance1.count());
                            console.error(`Error reading variable ${variableName} from contract ${address}:`, err);
                        }
                    }

                    const methodAbi = writeMethodAbi(functionName, variableName);
                    // Calling the specified function on the current contract with the collected values
                    const currentContract = new ethers.Contract(currentContractAddress, methodAbi, wallet);

                    try {
                        await currentContract[functionName](values, valueVersions);
                        console.log(`${currentContractAddress} function called!`)
                    } catch (err) {
                        console.error(`Error calling function ${functionName} on contract ${currentContractAddress}:`, err);
                    }
                } catch (err) {
                    console.error('Error handling ReadValuesRequested event:', err);
                }
            });
        } catch (err) {
            console.error(`Failed to set up event listener for bridge contract ${config.address}:`, err);
        }
    }
}

listenToBridgeEvents();
setInterval(() => {}, 1000);