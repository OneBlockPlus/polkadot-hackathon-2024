import { mnemonicGenerate } from "@polkadot/util-crypto";
import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";

const config = {
    //node:"wss://wss.android.im/tanssi",
    node: "wss://fraa-flashbox-2690-rpc.a.stagenet.tanssi.network",  //Tanssi appchain URI
    target: 12000,           //How long to create a new block
}

const subs = {};      //subscribe funs

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
        let stamp = 0;
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
}

let wsAPI = null;
let linking = false;
const self = {
    init: (ck, proxy) => {
        const uri = config.node;
        if (linking) return setTimeout(() => {
            self.init(ck);
        }, 500);

        if (wsAPI !== null) return ck && ck(wsAPI);

        linking = true;
        const provider = new WsProvider(uri);
        ApiPromise.create({ provider: provider }).then((api) => {
            console.log(`Linked to node ${uri}`);
            wsAPI = api;
            linking = false;

            //add the listener;
            wsAPI.rpc.chain.subscribeFinalizedHeads((lastHeader) => {
                const data = JSON.parse(JSON.stringify(lastHeader));
                const block = data.number - 1;      //get the right block number
                const hash = data.parentHash;     //get the finalized hash
                for (let k in subs) {
                    subs[k](block, hash);
                }
            });
            return ck && ck(wsAPI);
        }).catch((error) => {
            console.log(error);
            linking = false;
            return ck && ck(error);
        });

        // window.addEventListener("unhandledrejection", event => {
        //     console.error("Unhandled promise rejection:", event.reason);
        // });
    },
    metadata:(ck)=>{
        self.init(() => {
            wsAPI.rpc.state.getMetadata().then((res) => {
                return ck && ck(res);
            }).catch((error)=>{
                return ck && ck({error:"Invalid request"});
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
            return ck && ck({ error: "Invalid file" });
        }
    },
    generate: (password, ck, network) => {
        const mnemonic = mnemonicGenerate();
        const keyring = new Keyring({ type: "sr25519" });
        const pair = keyring.addFromUri(mnemonic);
        const sign = pair.toJson(password);
        sign.meta.from = "iNFT";
        sign.meta.support=["anchor","tanssi"];
        sign.meta.network=!network?"anchor":network;
        return ck && ck(sign,mnemonic);
    },
    transfer: (pair, to, amount, ck) => {
        self.init(() => {
            const dest = { Id: to };
            const m = self.divide();
            try {
                wsAPI.tx.balances.transferAllowDeath(dest, parseInt(amount * m)).signAndSend(pair, (res) => {
                    const status = res.status.toJSON();
                    console.log(status);
                });
            } catch (error) {
                return ck && ck({ error: "Internal error." });
            }

        });
    },
    divide: () => {
        return 1000000000000;
    },

    balance: (address, ck) => {
        let unsub = null;
        wsAPI.query.system.account(address, (res) => {
            if (unsub != null) unsub();
            const data = res.toJSON().data;
            return ck && ck(data);
        }).then((fun) => {
            unsub = fun;
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
    view: (value, type, ck) => {
        self.init(() => {
            switch (type) {
                case "anchor":
                    //1.if set block,search directly
                    if (value.block !== undefined) return wsAPI.rpc.chain.getBlockHash(value.block, (res) => {
                        const hash = res.toJSON();

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
                                        block: value.block
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
                        });
                    });

                    //2.check the latest block of the name
                    self.view(value.name, "owner", (owner) => {
                        //console.log(owner);
                        return self.view({ name: value.name, block: owner.block }, "anchor", ck);
                    });

                    break;
                case "selling":
                    let unselling = null;
                    wsAPI.query.anchor.sellList(value, (res) => {
                        unselling();
                        const dt = res.toJSON();
                        if (!dt) return ck && ck(false);

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
                    wsAPI.rpc.chain.getBlock(value).then((dt) => {
                        const exs = dt.block.extrinsics;
                        if (exs.length === 4) return [];

                        exs.forEach((ex, index) => {
                            if (index < 4) return false;
                            //console.log(ex);
                            const row = ex.toHuman();
                            console.log(row);
                            //console.log(ex.toJSON());
                        });
                    });
                    // wsAPI.query.system.events.at(value,(evs)=>{
                    //     const status=funs.status(evs);
                    //     const arr=funs.filter(evs,"TransactionFeePaid",status);
                    //     console.log(arr);
                    // });
                    break;
                case "blocknumber":   //value: hash(64)
                    wsAPI.rpc.chain.getBlockHash(value, (res) => {
                        const hash = res.toHex();
                        return self.view(hash, "detail", ck);
                    });

                    break;

                default:
                    break;
            }


        });
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
    test_metadata:()=>{
        self.metadata((dt)=>{
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