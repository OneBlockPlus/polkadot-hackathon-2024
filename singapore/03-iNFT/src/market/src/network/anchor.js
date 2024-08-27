import { mnemonicGenerate } from "@polkadot/util-crypto";
import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";
import { web3Accounts, web3Enable, web3FromAddress } from "@polkadot/extension-dapp";

import Config from "../system/config";
import Status from "../system/status";

const dt = Config.get(["network", "anchor"]);
const config = {
    node: dt.nodes[0],  //Tanssi appchain URI
    target: dt.interval,           //How long to create a new block
}

const subs = {};        //subscribe funs
const registry={};        //chainspec details

const limits = {
    key: 40,					//Max length of anchor name ( ASCII character )
    protocol: 256,			//Max length of protocol	
    raw: 350,		        //Max length of raw data
    address: 48,				//SS58 address length
};

const funs = {
    limited: (key, raw, protocol, address) => {
        if (key !== undefined) return key.length > limits.key ? true : false;
        if (protocol !== undefined) return protocol.length > limits.protocol ? true : false;
        if (raw !== undefined) return raw.length > limits.raw ? true : false;
        if (address !== undefined) return address.length !== limits.address ? true : false;
        return false;
    },

    // there are two "InBlock" functions.
    decodeProcess: (obj, ck) => {
        if (!obj || obj.dispatchError !== undefined) return ck && ck({ error: "Failed to write to chain." });
        if (!obj.status) return ck && ck({ error: "Invalid format" });
        if (obj.status === "Ready") {
            return ck && ck({ msg: "Ready to write to network.", success: true, status: "Ready", code: 2 });
        } else if (obj.status.Broadcast) {
            return ck && ck({ msg: "Broadcast to nodes.", success: true, status: "Broadcast", code: 3 });
        } else if (obj.status.InBlock) {
            return ck && ck({ msg: "Already packed, ready to update.", success: true, status: "InBlock", code: 5 });
        } else if (obj.status.Retracted) {
            return ck && ck({ msg: "Trying to write.", success: true, status: "Retracted", code: 4 });       //not everytime
        } else if (obj.status.Finalized) {
            return ck && ck({ msg: "Done, write to network", success: true, status: "Finalized", hash: obj.status.Finalized, code: 8 });
        } else {
            return ck && ck({ error: "Unknow result" });
        }
    },
    filter: (exs, method, status) => {
        console.log(exs);
        let arr = [];
        exs.forEach((ex, index) => {
            console.log(ex)
            // if(index===0){
            // 	stamp=ex.toHuman().method.args.now.replace(/,/gi, "");
            // }
            // if(index===0 || status[index]!=="ExtrinsicSuccess") return false;
            // const dt = ex.toHuman();
            // if (dt.method.method === method) {
            // 	const res = dt.method;
            // 	res.owner = dt.signer.Id;
            // 	res.stamp = stamp;
            // 	arr.push(res);
            // }
        });
        return arr;
    },
    status: (list) => {
        const evs = list.toHuman();
        const map = {};
        for (let i = 0; i < evs.length; i++) {
            const ev = evs[i], index = ev.phase.ApplyExtrinsic;
            if (ev.event.section !== "system") continue;
            map[index] = ev.event.method;
        }
        return map;
    },
    detail:(obj)=>{
        registry.decimals=obj.chainDecimals;
    },
}

let wsAPI = null;
let linking = false;
const self = {
    init: (ck) => {
        const uri = config.node;
        if (linking) return setTimeout(() => {
            self.init(ck);
        }, 500);

        if (wsAPI !== null) return ck && ck(wsAPI);

        linking = true;
        Status.set(uri, 2);      //trying, update uri status
        const provider = new WsProvider(uri);
        ApiPromise.create({ provider: provider }).then((api) => {
            console.log(`Linked to node ${uri}`);

            funs.detail(api.registry);
            wsAPI = api;
            linking = false;
            Status.set(uri, 1);      //normal, update uri status
            //add the listener;
            wsAPI.rpc.chain.subscribeFinalizedHeads((lastHeader) => {
                const data = JSON.parse(JSON.stringify(lastHeader));
                const block = data.number - 1;      //get the right block number
                const hash = data.parentHash;       //get the finalized hash
                for (let k in subs) {
                    subs[k](block, hash);
                }
            });
            return ck && ck(wsAPI);
        }).catch((error) => {
            console.log(error);
            Status.set(uri, 4);  //failed, update uri status
            linking = false;
            return ck && ck(error);
        });
    },
    metadata: (ck) => {
        self.init(() => {
            wsAPI.rpc.state.getMetadata().then((res) => {
                return ck && ck(res);
            }).catch((error) => {
                return ck && ck({ error: "Invalid request" });
            });
        });
    },
    reset: (ck, proxy) => {
        console.log(`Restart system link`);
    },

    unsubscribe: (key) => {
        delete subs[key];
    },
    subscribe: (key, fun) => {
        self.init(() => {
            if (subs[key] !== undefined) delete subs[key];     //remove old function 
            subs[key] = fun;     //add the subcribe function to the map
        });
    },
    load: (fa, password, ck) => {
        try {
            const acc = JSON.parse(fa);
            const keyring = new Keyring({ type: "sr25519" });
            const pair = keyring.createFromJson(acc);
            try {
                pair.decodePkcs8(password);
                return ck && ck(pair);
            } catch (error) {
                return ck && ck({ error: "Invalid passoword" });
            }
        } catch (error) {
            console.log(error);
            return ck && ck({ error: "Invalid file" });
        }
    },
    generate: (password, ck) => {
        self.init(() => {
            const mnemonic = mnemonicGenerate();
            const keyring = new Keyring({ type: "sr25519" });
            const pair = keyring.addFromUri(mnemonic);
            const sign = pair.toJson(password);
            const row = {
                address: sign.address,
                encoded: sign.encoded,
                network: "anchor",
                encoding: sign.encoding,
                metadata: sign.meta,
            }

            return ck && ck(row, mnemonic);
        });
    },
    transfer: (pair, to, amount, ck, wallet, address) => {
        self.init(() => {
            const dest = { Id: to };
            const m = self.accuracy();
            try {
                if(!wallet){
                    wsAPI.tx.balances.transferAllowDeath(dest, parseInt(amount * m)).signAndSend(pair, (res) => {
                        const status = res.status.toJSON();
                        return ck && ck(status);
                    });
                }else{
                    wsAPI.tx.balances.transferAllowDeath(dest, parseInt(amount * m)).signAndSend(address, { signer: pair }, (res) => {
                        const status = res.status.toJSON();
                        return ck && ck(status);
                    });
                }
            } catch (error) {
                return ck && ck({ error: "Internal error." });
            }

        });
    },

    balance: (address, ck) => {
        self.init(() => {
            let unsub = null;
            wsAPI.query.system.account(address, (res) => {
                if (unsub != null) unsub();
                const data = res.toJSON().data;

                return ck && ck(data);
            }).then((fun) => {
                unsub = fun;
            });
        });
    },

    write: (pair, obj, ck) => {
        self.init(() => {
            let { anchor, raw, protocol } = obj;
            if (typeof protocol !== "string") protocol = JSON.stringify(protocol);
            if (typeof raw !== "string") raw = JSON.stringify(raw);
            if (funs.limited(anchor, raw, protocol)) return ck && ck({ error: "Params error" });

            const pre = 0;
            try {
                wsAPI.tx.anchor.setAnchor(anchor, raw, protocol, pre).signAndSend(pair, (res) => {
                    const dt = res.toHuman();
                    //console.log(dt);
                    funs.decodeProcess(dt, (status) => {
                        //console.log(status);
                        return ck && ck(status);
                    });
                });
            } catch (error) {
                return ck && ck(error);
            }
        });
    },

    wallet: async (dapp, ck) => {
        const extensions = await web3Enable(dapp);
        if (extensions.length === 0) {
            return ck && ck({ error: "No subwallet extention" });
        }
        const allAccounts = await web3Accounts();
        const account = allAccounts[0];
        const injector = await web3FromAddress(account.address);
        return ck && ck(injector, account.address);
    },
    sell: (pair, name, price, ck, target) => {
        self.init(() => {
            self.view(name, "owner", (signer) => {
                if (signer === false || pair.address !== signer.address) return ck && ck({ error: "Invalid owner of iNFT." });
                try {
                    wsAPI.tx.anchor.sellAnchor(name, price, !target ? signer.address : target).signAndSend(pair, (res) => {
                        const dt = res.toHuman();
                        funs.decodeProcess(dt, (status) => {
                            return ck && ck(status);
                        });
                    });
                } catch (error) {
                    return ck && ck({ error: error });
                }
            });
        });
    },
    sign: async (obj, ck, wallet, param) => {
        self.init(async () => {
            let { anchor, raw, protocol } = obj;
            if (typeof protocol !== "string") protocol = JSON.stringify(protocol);
            if (typeof raw !== "string") raw = JSON.stringify(raw);
            if (funs.limited(anchor, raw, protocol)) return ck && ck({ error: "Params error" });

            const pre = 0;

            const extensions = await web3Enable(obj.dapp);
            if (extensions.length === 0) {
                return ck && ck({ error: "No subwallet extention" });
            }

            const allAccounts = await web3Accounts();
            const account = allAccounts[0];
            const injector = await web3FromAddress(account.address);
            //console.log(injector);
            const tx = wsAPI.tx.anchor.setAnchor(anchor, raw, protocol, pre);
            tx.signAndSend(account.address, { signer: injector.signer }, (res) => {
                const dt = res.toHuman();
                funs.decodeProcess(dt, (status) => {
                    return ck && ck(status);
                });
            }).catch((error) => {
                return ck && ck({ error: "Sign error, maybe low balance." });
            });
        })
    },
    buy: (pair, anchor, ck, wallet, address) => {
        self.init(() => {
            anchor = anchor.toLocaleLowerCase();
            if (funs.limited(anchor)) return ck && ck({ error: "Name error" });

            self.view(anchor, "owner", (owner) => {
                self.view(anchor, "selling", (dt) => {
                    const cost = dt[1] * self.accuracy();
                    if (owner.addresss === (wallet ? address : pair.address)) return ck && ck({ error: "Your own anchor" });
                    if (dt[0] !== dt[2] && dt[2] !== (wallet ? address : pair.address)) return ck && ck({ error: "Your can not buy this one" });
                    self.balance((wallet ? address : pair.address), (bc) => {
                        if (bc.free < cost) return ck && ck({ error: "Low balance" });
                        try {
                            if (wallet) {
                                console.log(address,pair);
                                wsAPI.tx.anchor.buyAnchor(anchor).signAndSend(address, { signer: pair }, (res) => {
                                    const dt = res.toHuman();
                                    funs.decodeProcess(dt, (status) => {
                                        return ck && ck(status);
                                    });
                                });
                            } else {
                                wsAPI.tx.anchor.buyAnchor(anchor).signAndSend(pair, (res) => {
                                    const dt = res.toHuman();
                                    funs.decodeProcess(dt, (status) => {
                                        return ck && ck(status);
                                    });
                                });
                            }

                        } catch (error) {
                            return ck && ck({ error: error });
                        }
                    });
                });
            });
        });
    },
    revoke: (pair, name, ck) => {
        self.init(() => {
            self.view(name, "owner", (signer) => {
                if (signer === false || pair.address !== signer.address) return ck && ck({ error: "Invalid owner of iNFT." });
                try {
                    wsAPI.tx.anchor.unsellAnchor(name).signAndSend(pair, (res) => {
                        const dt = res.toHuman();
                        funs.decodeProcess(dt, (status) => {
                            return ck && ck(status);
                        });
                    });
                } catch (error) {
                    return ck && ck({ error: error });
                }
            });
        });
    },
    divert: (pair, name,target, ck) => {
        self.init(() => {
            self.view(name, "owner", (signer) => {
                if (signer === false || pair.address !== signer.address) return ck && ck({ error: "Invalid owner of iNFT." });
                try {
                    wsAPI.tx.anchor.divertAnchor(name,target).signAndSend(pair, (res) => {
                        const dt = res.toHuman();
                        funs.decodeProcess(dt, (status) => {
                            return ck && ck(status);
                        });
                    });
                } catch (error) {
                    return ck && ck({ error: error });
                }
            });
        });
    },
    drop: (pair, name,lastwords, ck) => {
        self.init(() => {
            self.view(name, "owner", (signer) => {
                if (signer === false || pair.address !== signer.address) return ck && ck({ error: "Invalid owner of iNFT." });
                try {
                    wsAPI.tx.anchor.dropAnchor(name,lastwords).signAndSend(pair, (res) => {
                        const dt = res.toHuman();
                        funs.decodeProcess(dt, (status) => {
                            return ck && ck(status);
                        });
                    });
                } catch (error) {
                    return ck && ck({ error: error });
                }
            });
        });
    },
    view: (value, type, ck) => {
        self.init(() => {
            switch (type) {
                case "anchor":
                    //1.if set block,search directly
                    if (value.block !== undefined) return wsAPI.rpc.chain.getBlockHash(value.block, (res) => {
                        const hash = res.toJSON();
                        if(hash==="0x0000000000000000000000000000000000000000000000000000000000000000") return ck && ck(false);
                        wsAPI.rpc.chain.getBlock(hash).then((full) => {
                            let data = null;
                            full.block.extrinsics.forEach((ex, index) => {
                                const row = ex.toHuman();
                                const dt = row.method;

                                if (dt.method === "setAnchor" && dt.args.key === value.name) {
                                    data = {
                                        owner: row.signer.Id,
                                        name: dt.args.key,
                                        raw: dt.args.raw,
                                        protocol: dt.args.protocol,
                                        pre: parseInt(dt.args.pre),
                                        block: value.block,
                                        hash: hash,
                                        network: "anchor",
                                    }
                                }
                            });

                            if (data !== null) {
                                try {
                                    data.raw = JSON.parse(data.raw);
                                    data.protocol = JSON.parse(data.protocol);
                                    return ck && ck(data);
                                } catch (error) {
                                    return ck && ck(data);
                                }
                            } else {
                                return ck && ck(false);
                            }
                        }).catch((err)=>{
                            console.log(err);
                            return ck && ck(false);
                        });
                    });

                    //2.check the latest block of the name
                    self.view(value.name, "owner", (owner) => {
                        if (!owner) return ck && ck(false);
                        return self.view({ name: value.name, block: owner.block }, "anchor", ck);
                    });

                    break;
                case "selling":
                    let unselling = null;
                    wsAPI.query.anchor.sellList(value, (res) => {
                        unselling();
                        const dt = res.toJSON();
                        if (!dt) return ck && ck(false);
                        dt[1]=parseFloat(dt[1]/self.divide());
                        return ck && ck(dt);
                    }).then((fun) => {
                        unselling = fun;
                    });
                    break;

                case "owner":
                    let unsub = null;
                    wsAPI.query.anchor.anchorOwner(value, (res) => {
                        unsub();
                        const dt = res.toJSON();
                        if (!dt) return ck && ck(false);

                        return ck && ck({ address: dt[0], block: dt[1] });
                    }).then((fun) => {
                        unsub = fun;
                    });
                    break;

                case "block":   //value: hash(64)
                    wsAPI.rpc.chain.getBlock(value).then((dt) => {
                        const obj = dt.toJSON();
                        return ck && ck({ block: obj.block.header.number });
                    });

                    break;
                case "detail":
                    wsAPI.rpc.chain.getBlock(value).then((res) => {
                        //console.log(res.toJSON());
                        const exs = res.block.extrinsics;
                        const bk=res.block.header.toJSON();
                        //console.log(bk);
                        const infts = [];
                        if (exs.length === 1) return ck && ck(infts);
                        exs.forEach((ex, index) => {
                            if (index < 2) return false;
                            const row = ex.toHuman();
                            if (row.method && row.method.section === "anchor" && row.method.method === "setAnchor") {
                                const dt = row.method.args;
                                //console.log(dt);
                                try {
                                    const protocol = JSON.parse(dt.protocol);
                                    if(protocol && protocol.tpl && protocol.tpl.toLowerCase() ==="inft"){
                                        const raw = JSON.parse(dt.raw);
                                        const inft = {
                                            name: dt.key,
                                            raw: raw,
                                            protocol: protocol,
                                            pre: parseInt(dt.pre),
                                            signer: row.signer.Id,
                                            owner:row.signer.Id,
                                            hash: value,
                                            block:bk.number,
                                            valid: true,
                                            network: "anchor",
                                        }
                                        infts.push(inft);
                                    }
                                } catch (error) {

                                }
                            }
                        });
                        return ck && ck(infts);
                    });
                    break;
                case "blocknumber":   //value: hash(64)
                    wsAPI.rpc.chain.getBlockHash(value, (res) => {
                        const hash = res.toHex();
                        return self.view(hash, "detail", ck);
                    });
                    break;
                case "hash":
                    wsAPI.rpc.chain.getBlockHash(value, (res) => {
                        const hash = res.toHex();
                        return ck && ck(hash);
                    });
                    break;
                case "transaction":

                    break;
                default:
                    break;
            }


        });
    },
    market: (ck) => {
        self.init(() => {
            wsAPI.query.anchor.sellList.entries().then((arr) => {
                let list = [];
                if (!arr) return ck && ck(list);
                for (let i = 0; i < arr.length; i++) {
                    const row = arr[i];
                    const key = row[0].toHuman();
                    const info = row[1].toHuman();
                    const price=parseFloat(parseInt(info[1].replaceAll(",",""))/self.divide());
                    list.push({
                        name: key[0],
                        owner: info[0],
                        price: price,
                        target: info[2],
                        free: info[0] === info[2],
                    });
                }
                return ck && ck(list);
            });
        });
    },
    divide: () => {
        return 1000000;
    },
    accuracy: (ck) => {
        self.init(()=>{
            return  ck && ck( Math.pow(10, registry.decimals));
        });
    },
    events:{        //TODO, here to add events listeners.
        payed:()=>{

        },
    },
    test: () => {
        test.auto();
    }
}

const test = {
    auto: () => {
        test.test_view();
        test.test_metadata();
    },
    test_metadata: () => {
        self.metadata((dt) => {
            console.log(dt.toHuman());
        });
    },
    test_view: () => {
        const block = 384394;
        self.view(block, "blocknumber", (dt) => {
            console.log(dt);
        });
    },
}

export default self;