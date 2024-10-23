import { createStore } from 'vuex'

const store = createStore({
    state: {
        walletAddress: null, // 存储连接的钱包地址
        isConnected: false, // 标记钱包是否连接
    },
    mutations: {
        setWalletAddress(state, address) {
            state.walletAddress = address;
            state.isConnected = true;
        },
        resetWallet(state) {
            state.walletAddress = null;
            state.isConnected = false;
        },
    },
    actions: {
        async connectWallet({ commit }) {
            try {
                // 检查是否安装了 MetaMask
                if (window.ethereum) {
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    commit('setWalletAddress', accounts[0]);
                } else {
                    alert('MetaMask is not installed');
                }
            } catch (error) {
                console.error('Failed to connect wallet', error);
            }
        },
        disconnectWallet({ commit }) {
            commit('resetWallet');
        },
    },
    getters: {
        walletAddress: (state) => state.walletAddress,
        isConnected: (state) => state.isConnected,
    },
})

export default store;
