class XenonService {
    constructor() {
        this.api = null;
        this.accounts = [];
    }

    async connect(nodeUrl = 'ws://127.0.0.1:9944') {
        try {
            const { ApiPromise, WsProvider } = polkadotApi;
            const provider = new WsProvider(nodeUrl);
            this.api = await ApiPromise.create({ provider });
            
            // Enable web3 extension
            const { web3Enable, web3AccountsSubscribe } = polkadotExtensionDapp;
            const extensions = await web3Enable('Xenon DID Dashboard');
            
            if (extensions.length === 0) {
                throw new Error('No web3 extension found');
            }

            // Subscribe to accounts
            await web3AccountsSubscribe((accounts) => {
                this.accounts = accounts;
                this.onAccountsChanged?.(accounts);
            });

            return true;
        } catch (error) {
            console.error('Connection error:', error);
            return false;
        }
    }

    async createDid(account) {
        if (!this.api) throw new Error('API not initialized');

        try {
            const tx = this.api.tx.xenon.createDid();
            const injector = await this.getInjector(account);
            
            return new Promise((resolve, reject) => {
                tx.signAndSend(account, { signer: injector.signer }, ({ status, events }) => {
                    if (status.isInBlock) {
                        events.forEach(({ event }) => {
                            if (this.api?.events.xenon.DidDocumentCreated.is(event)) {
                                resolve(event.data);
                            }
                        });
                    }
                }).catch(reject);
            });
        } catch (error) {
            console.error('Create DID error:', error);
            throw error;
        }
    }

    async linkChain(account, chainName, chainId, address) {
        if (!this.api) throw new Error('API not initialized');

        try {
            const tx = this.api.tx.xenon.linkChain(
                this.stringToU8a(chainName),
                chainId,
                this.stringToU8a(address)
            );
            
            const injector = await this.getInjector(account);
            
            return new Promise((resolve, reject) => {
                tx.signAndSend(account, { signer: injector.signer }, ({ status, events }) => {
                    if (status.isInBlock) {
                        events.forEach(({ event }) => {
                            if (this.api?.events.xenon.ChainLinked.is(event)) {
                                resolve(event.data);
                            }
                        });
                    }
                }).catch(reject);
            });
        } catch (error) {
            console.error('Link chain error:', error);
            throw error;
        }
    }

    async unlinkChain(account, chainId) {
        if (!this.api) throw new Error('API not initialized');

        try {
            const tx = this.api.tx.xenon.unlinkChain(chainId);
            const injector = await this.getInjector(account);
            
            return new Promise((resolve, reject) => {
                tx.signAndSend(account, { signer: injector.signer }, ({ status, events }) => {
                    if (status.isInBlock) {
                        events.forEach(({ event }) => {
                            if (this.api?.events.xenon.ChainUnlinked.is(event)) {
                                resolve(event.data);
                            }
                        });
                    }
                }).catch(reject);
            });
        } catch (error) {
            console.error('Unlink chain error:', error);
            throw error;
        }
    }

    async getDidDocument(account) {
        if (!this.api) throw new Error('API not initialized');

        try {
            const document = await this.api.query.xenon.didDocuments(account);
            return document.unwrapOr(null);
        } catch (error) {
            console.error('Get DID document error:', error);
            throw error;
        }
    }

    async getInjector(account) {
        const accountData = this.accounts.find(acc => acc.address === account);
        if (!accountData) throw new Error('Account not found');
        return accountData.meta.source;
    }

    stringToU8a(str) {
        return new TextEncoder().encode(str);
    }

    setAccountsChangedCallback(callback) {
        this.onAccountsChanged = callback;
    }
}

// Create a global instance
window.xenonService = new XenonService();