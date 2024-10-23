import Web3 from 'web3';

let LibMarketMainABI;

async function loadABI() {
  const response = await fetch('https://d.cess.network/870781361.json');
  LibMarketMainABI = await response.json();
}

loadABI();

const contractAddress = '0x7e2955a538d2b396cdfd172fd150c24b46d70cee';
const moonbaseAlphaRPC = 'https://moonbase-rpc.dwellir.com';

let web3;
let libMarketContract;

export const initWeb3 = async () => {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            // Ensure MetaMask is connected to the Moonbase Alpha testnet
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: '0x507', // 1287 in hexadecimal
                    chainName: 'Moonbase Alpha',
                    nativeCurrency: {
                        name: 'DEV',
                        symbol: 'DEV',
                        decimals: 18
                    },
                    rpcUrls: [moonbaseAlphaRPC],
                    blockExplorerUrls: ['https://moonbase.moonscan.io/']
                }]
            });
        } catch (error) {
            console.error("User denied account access or failed to switch network", error);
        }
    } else {
        // If MetaMask is not detected, use the Moonbase Alpha RPC provider
        web3 = new Web3(new Web3.providers.HttpProvider(moonbaseAlphaRPC));
    }

    libMarketContract = new web3.eth.Contract(LibMarketMainABI, contractAddress);
    console.log('Contract methods:', Object.keys(libMarketContract.methods));
    return { web3, libMarketContract };
};

// Adjust these methods according to your LibMarket_Main.sol contract
export const listItem = async (name, description, price) => {
    try {
        const accounts = await web3.eth.getAccounts();
        console.log('Current account:', accounts[0]);
        console.log('Listing item:', { name, description, price });
        // Replace 'YOUR_ACTUAL_FUNCTION_NAME' with the actual function name in your contract
        const result = await libMarketContract.methods.YOUR_ACTUAL_FUNCTION_NAME(name, description, web3.utils.toWei(price, 'ether'))
            .send({ from: accounts[0] });
        console.log('Transaction result:', result);
        return result;
    } catch (error) {
        console.error('Error in listItem:', error);
        throw error;
    }
};

export const buyItem = async (itemId, price) => {
    const accounts = await web3.eth.getAccounts();
    // Call the contract's purchaseItem function, function name and parameters may need to be adjusted according to the actual contract
    await libMarketContract.methods.purchaseItem(itemId).send({ from: accounts[0], value: web3.utils.toWei(price, 'ether') });
};

export const getItems = async () => {
    try {
        const tradeCount = await libMarketContract.methods.tradeCounter().call();
        const items = [];
        for (let i = 1; i <= tradeCount; i++) {
            const trade = await libMarketContract.methods.trades(i).call();
            items.push({
                id: i,
                seller: trade.seller,
                buyer: trade.buyer,
                amount: web3.utils.fromWei(trade.amount, 'ether'),
                status: trade.status,
                timelock: trade.timelock
            });
        }
        return items;
    } catch (error) {
        console.error('Error in getItems:', error);
        throw error;
    }
};

// 可以添加其他需要的函数，比如获取用户自己的物品、获取交易历史等
export const getUserItems = async () => {
    const accounts = await web3.eth.getAccounts();
    const tradeCount = await libMarketContract.methods.tradeCounter().call();
    const items = [];
    for (let i = 1; i <= tradeCount; i++) {
        const trade = await libMarketContract.methods.trades(i).call();
        if (trade.seller.toLowerCase() === accounts[0].toLowerCase()) {
            items.push({
                id: i,
                buyer: trade.buyer,
                amount: web3.utils.fromWei(trade.amount, 'ether'),
                status: trade.status,
                timelock: trade.timelock
            });
        }
    }
    return items;
};

// 其他可能需要的函数...

export const createTrade = async (seller, timelock, value) => {
    try {
        const accounts = await web3.eth.getAccounts();
        console.log('Current account:', accounts[0]);
        const hashLock = '0x0000000000000000000000000000000000000000000000000000000000000000'; // 暂时使用空的哈希锁
        console.log('Creating trade:', { seller, timelock, hashLock, value });
        const result = await libMarketContract.methods.createTrade(seller, hashLock, timelock)
            .send({ from: accounts[0], value: web3.utils.toWei(value, 'ether') });
        console.log('Transaction result:', result);
        return result;
    } catch (error) {
        console.error('Error in createTrade:', error);
        throw error;
    }
};

// 其他可能需要的函数...
