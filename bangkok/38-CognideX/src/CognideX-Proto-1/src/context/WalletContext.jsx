import React, { createContext, useState, useEffect, useCallback } from 'react';
import { BrowserProvider } from 'ethers';

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
    const [walletAddress, setWalletAddress] = useState('');
    const [provider, setProvider] = useState(null);

    const switchToMoonbaseAlphaNetwork = useCallback(async () => {
        const chainIdHex = '0x507'; // 1287 in hex
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: chainIdHex }],
            });
            console.log('Successfully switched to Moonbase Alpha network');
        } catch (switchError) {
            if (switchError.code === 4902) {
                // The network has not been added to MetaMask
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [
                            {
                                chainId: chainIdHex,
                                chainName: 'Moonbase Alpha',
                                rpcUrls: ['https://rpc.api.moonbase.moonbeam.network'],
                                nativeCurrency: {
                                    name: 'DEV',
                                    symbol: 'DEV',
                                    decimals: 18,
                                },
                                blockExplorerUrls: ['https://moonbase.moonscan.io/'],
                            },
                        ],
                    });
                    // Try switching again after adding
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: chainIdHex }],
                    });
                    console.log('Successfully added and switched to Moonbase Alpha network');
                } catch (addError) {
                    console.error('Failed to add Moonbase Alpha network to MetaMask:', addError);
                    alert('Failed to add Moonbase Alpha network. Please add it manually in MetaMask.');
                }
            } else if (switchError.code === 4001) {
                // User rejected the request
                alert('Please switch to the Moonbase Alpha network in MetaMask.');
            } else {
                console.error('Failed to switch to Moonbase Alpha network:', switchError);
                alert('An error occurred while switching networks. Please switch to Moonbase Alpha manually.');
            }
        }
    }, []);

    const connectWallet = useCallback(async () => {
        if (typeof window.ethereum !== 'undefined') {
            if (window.ethereum.isMetaMask) {
                try {
                    const metamaskProvider = window.ethereum;

                    // Request account access
                    await metamaskProvider.request({ method: 'eth_requestAccounts' });

                    let ethersProvider = new BrowserProvider(metamaskProvider);
                    let network = await ethersProvider.getNetwork();
                    let chainId = Number(network.chainId);

                    console.log('Connected to network:', chainId);

                    // Check if connected to Moonbase Alpha (chainId: 1287)
                    if (chainId !== 1287) {
                        // Attempt to switch networks
                        await switchToMoonbaseAlphaNetwork();

                        // Reinitialize provider and network after switching
                        ethersProvider = new BrowserProvider(metamaskProvider);
                        network = await ethersProvider.getNetwork();
                        chainId = Number(network.chainId);

                        if (chainId !== 1287) {
                            alert('Please switch to the Moonbase Alpha network in MetaMask.');
                            return;
                        }
                    }

                    const signer = await ethersProvider.getSigner();
                    const account = await signer.getAddress();
                    console.log('Connected account:', account);
                    setWalletAddress(account);
                    setProvider(ethersProvider);
                } catch (error) {
                    console.error('Error connecting to MetaMask:', error);
                    alert('Failed to connect to MetaMask. Please ensure MetaMask is installed and try again.');
                }
            } else {
                // MetaMask is not installed
                alert('MetaMask is not installed. Please install MetaMask extension from https://metamask.io/');
            }
        } else {
            console.log('Ethereum provider not detected');
            alert('Please install MetaMask extension!');
        }
    }, [switchToMoonbaseAlphaNetwork]);

    const disconnectWallet = useCallback(() => {
        setWalletAddress('');
        setProvider(null);
    }, []);

    useEffect(() => {
        if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
            const metamaskProvider = window.ethereum;

            const handleChainChanged = async (chainIdHex) => {
                const chainId = parseInt(chainIdHex, 16);
                console.log('Chain changed:', chainId);

                if (chainId !== 1287) {
                    alert('Please switch to the Moonbase Alpha network in MetaMask.');
                    disconnectWallet();
                } else {
                    // Re-initialize provider and signer
                    const ethersProvider = new BrowserProvider(metamaskProvider);
                    const signer = await ethersProvider.getSigner();
                    const account = await signer.getAddress();
                    setWalletAddress(account);
                    setProvider(ethersProvider);
                }
            };

            const handleAccountsChanged = (accounts) => {
                if (accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                } else {
                    disconnectWallet();
                }
            };

            metamaskProvider.on('chainChanged', handleChainChanged);
            metamaskProvider.on('accountsChanged', handleAccountsChanged);

            return () => {
                metamaskProvider.removeListener('chainChanged', handleChainChanged);
                metamaskProvider.removeListener('accountsChanged', handleAccountsChanged);
            };
        }
    }, [disconnectWallet]);

    return (
        <WalletContext.Provider
            value={{
                walletAddress,
                provider,
                connectWallet,
                disconnectWallet,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
};
