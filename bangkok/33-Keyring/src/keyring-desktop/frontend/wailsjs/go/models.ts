export namespace database {
	
	export class DatabaseTokenTransferInfo {
	    chainName: string;
	    address: string;
	    hash: string;
	    timestamp: number;
	    from: string;
	    to: string;
	    value: string;
	    contract: string;
	    symbol: string;
	    type: string;
	
	    static createFrom(source: any = {}) {
	        return new DatabaseTokenTransferInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.chainName = source["chainName"];
	        this.address = source["address"];
	        this.hash = source["hash"];
	        this.timestamp = source["timestamp"];
	        this.from = source["from"];
	        this.to = source["to"];
	        this.value = source["value"];
	        this.contract = source["contract"];
	        this.symbol = source["symbol"];
	        this.type = source["type"];
	    }
	}
	export class DatabaseTransactionInfo {
	    chainName: string;
	    address: string;
	    hash: string;
	    timestamp: number;
	    status: string;
	    from: string;
	    to: string;
	    value: string;
	    fee: string;
	
	    static createFrom(source: any = {}) {
	        return new DatabaseTransactionInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.chainName = source["chainName"];
	        this.address = source["address"];
	        this.hash = source["hash"];
	        this.timestamp = source["timestamp"];
	        this.status = source["status"];
	        this.from = source["from"];
	        this.to = source["to"];
	        this.value = source["value"];
	        this.fee = source["fee"];
	    }
	}

}

export namespace main {
	
	export class AssetInfo {
	    contractAddress: string;
	    symbol: string;
	    img: string;
	    balance?: string;
	    price?: number;
	
	    static createFrom(source: any = {}) {
	        return new AssetInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.contractAddress = source["contractAddress"];
	        this.symbol = source["symbol"];
	        this.img = source["img"];
	        this.balance = source["balance"];
	        this.price = source["price"];
	    }
	}
	export class ChainDetail {
	    name: string;
	    symbol: string;
	    img: string;
	    testnet: boolean;
	
	    static createFrom(source: any = {}) {
	        return new ChainDetail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.symbol = source["symbol"];
	        this.img = source["img"];
	        this.testnet = source["testnet"];
	    }
	}
	export class CardChainInfo {
	    chains: ChainDetail[];
	    lastSelectedChain: string;
	
	    static createFrom(source: any = {}) {
	        return new CardChainInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.chains = this.convertValues(source["chains"], ChainDetail);
	        this.lastSelectedChain = source["lastSelectedChain"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class CardCredential {
	    puk: string;
	    code: string;
	
	    static createFrom(source: any = {}) {
	        return new CardCredential(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.puk = source["puk"];
	        this.code = source["code"];
	    }
	}
	export class CardInfo {
	    id: number;
	    name: string;
	
	    static createFrom(source: any = {}) {
	        return new CardInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	    }
	}
	export class ChainAssets {
	    address: string;
	    symbol: string;
	    img: string;
	    balance?: string;
	    price?: number;
	    assets: AssetInfo[];
	
	    static createFrom(source: any = {}) {
	        return new ChainAssets(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.address = source["address"];
	        this.symbol = source["symbol"];
	        this.img = source["img"];
	        this.balance = source["balance"];
	        this.price = source["price"];
	        this.assets = this.convertValues(source["assets"], AssetInfo);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class FeeInfo {
	    gas: string;
	    decimals: number;
	    gasLimit: number;
	
	    static createFrom(source: any = {}) {
	        return new FeeInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.gas = source["gas"];
	        this.decimals = source["decimals"];
	        this.gasLimit = source["gasLimit"];
	    }
	}
	export class GetTransactionHistoryResponse {
	    chain: string;
	    address: string;
	    transactions: database.DatabaseTransactionInfo[];
	    tokenTransfers: database.DatabaseTokenTransferInfo[];
	
	    static createFrom(source: any = {}) {
	        return new GetTransactionHistoryResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.chain = source["chain"];
	        this.address = source["address"];
	        this.transactions = this.convertValues(source["transactions"], database.DatabaseTransactionInfo);
	        this.tokenTransfers = this.convertValues(source["tokenTransfers"], database.DatabaseTokenTransferInfo);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class InitCardResponse {
	    mnemonic: string;
	    cardInfo: CardInfo;
	
	    static createFrom(source: any = {}) {
	        return new InitCardResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.mnemonic = source["mnemonic"];
	        this.cardInfo = this.convertValues(source["cardInfo"], CardInfo);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class SelfUpdateResponse {
	    shouldUpdate: boolean;
	    currentVersion: string;
	    latestVersion: string;
	
	    static createFrom(source: any = {}) {
	        return new SelfUpdateResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.shouldUpdate = source["shouldUpdate"];
	        this.currentVersion = source["currentVersion"];
	        this.latestVersion = source["latestVersion"];
	    }
	}

}

export namespace utils {
	
	export class TokenConfig {
	    symbol: string;
	    img: string;
	    priceId: string;
	    decimals: number;
	    contract: string;
	
	    static createFrom(source: any = {}) {
	        return new TokenConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.symbol = source["symbol"];
	        this.img = source["img"];
	        this.priceId = source["priceId"];
	        this.decimals = source["decimals"];
	        this.contract = source["contract"];
	    }
	}
	export class ChainConfig {
	    name: string;
	    symbol: string;
	    img: string;
	    path: string;
	    priceId: string;
	    driver: string;
	    rpcUrl: string;
	    rpcAuth: string;
	    rpcProvider: string;
	    chainId: number;
	    addressPrefix: number;
	    explorer: string;
	    explorerTx: string;
	    explorerAddr: string;
	    decimals: number;
	    gasLimit: number;
	    tokenGasLimit: number;
	    maxFee: string;
	    testnet: boolean;
	    disable: boolean;
	    enableWalletConnect: boolean;
	    txHistoryUrl: string;
	    txHistoryAuth: string;
	    txHistoryProvider: string;
	    tokens: TokenConfig[];
	
	    static createFrom(source: any = {}) {
	        return new ChainConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.symbol = source["symbol"];
	        this.img = source["img"];
	        this.path = source["path"];
	        this.priceId = source["priceId"];
	        this.driver = source["driver"];
	        this.rpcUrl = source["rpcUrl"];
	        this.rpcAuth = source["rpcAuth"];
	        this.rpcProvider = source["rpcProvider"];
	        this.chainId = source["chainId"];
	        this.addressPrefix = source["addressPrefix"];
	        this.explorer = source["explorer"];
	        this.explorerTx = source["explorerTx"];
	        this.explorerAddr = source["explorerAddr"];
	        this.decimals = source["decimals"];
	        this.gasLimit = source["gasLimit"];
	        this.tokenGasLimit = source["tokenGasLimit"];
	        this.maxFee = source["maxFee"];
	        this.testnet = source["testnet"];
	        this.disable = source["disable"];
	        this.enableWalletConnect = source["enableWalletConnect"];
	        this.txHistoryUrl = source["txHistoryUrl"];
	        this.txHistoryAuth = source["txHistoryAuth"];
	        this.txHistoryProvider = source["txHistoryProvider"];
	        this.tokens = this.convertValues(source["tokens"], TokenConfig);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

