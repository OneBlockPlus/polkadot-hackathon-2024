import Web3 from 'web3';
import LibMarketMainABI from '../contracts/LibMarket_Main.json'; // 确保这个路径正确

const contractAddress = '0x796e32495172a142e934a3e0fcd5f08471ff37e4';
const infuraUrl = 'https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID'; // 替换为您的 Infura 项目 ID

let web3;
let libMarketContract;

export const initWeb3 = async () => {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            // 确保 MetaMask 连接到 Sepolia 测试网
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xaa36a7' }], // Sepolia 的 chainId
            });
        } catch (error) {
            console.error("User denied account access or failed to switch network", error);
        }
    } else {
        // 如果没有检测到 MetaMask，使用 Infura 提供的 Web3 提供者
        web3 = new Web3(new Web3.providers.HttpProvider(infuraUrl));
    }

    libMarketContract = new web3.eth.Contract(LibMarketMainABI, contractAddress);
    console.log('Contract methods:', Object.keys(libMarketContract.methods));
    return { web3, libMarketContract };
};

// 根据 LibMarket_Main.sol 中的函数调整这些方法
export const listItem = async (name, description, price) => {
    try {
        const accounts = await web3.eth.getAccounts();
        console.log('Current account:', accounts[0]);
        console.log('Listing item:', { name, description, price });
        // 将 'createItem' 替换为您合约中实际的函数名
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
    // 调用合约中的购买物品函数，函数名和参数可能需要根据实际合约调整
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