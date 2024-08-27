import TPL from "./tpl";
import Render from "../lib/render";
import Network from "../network/router";
import tools from "../lib/tools";
import INDEXED from "../lib/indexed";
import Config from "./config";

const config = {
    indexDB: "inftDB",
    table: "infts",
    keypath: "name",
    map: {
        name: { unique: true },
        stamp: { unique: false },
        thumb: { unique: false },
    },
}

const map = {};

let local = true;     //get iNFT render result from local

const DBname = Config.get(["storage", "DBname"]);
const fav_table="ifav";
const funs = {
    getConfig: () => {     //get config from Config file

    },
    checkTable: (from, list) => {
        for (let i = 0; i < list.length; i++) {
            if (list[i] === from) return true;
        }
        return false;
    },
    render: (tpl_name, hash, offset, ck) => {
        TPL.view(tpl_name, (dt) => {
            const basic = {
                cell: dt.cell,
                grid: dt.grid,
                target: dt.size
            }
            Render.thumb(hash, dt.image, dt.parts, basic, offset, ck);
        });
    },
    getThumb: (tpl_name, hash, offset, ck, key) => {
        //console.log(key);
        if (local) {
            //console.log(`Here to go...`);
            INDEXED.checkDB(config.indexDB, (db) => {
                //console.log(db);
                const tbs = db.objectStoreNames;
                if (!funs.checkTable(config.table, tbs)) {
                    //no indexDB, init it
                    const tb = { table: config.table, keyPath: config.keypath, map: config.map }
                    //console.log(`Ready to create table: ${JSON.stringify(tb)}`);
                    db.close();         //must close, or the DB is blocked
                    INDEXED.initDB(config.indexDB, [tb], db.version + 1).then((ndb) => {
                        //console.log(ndb);
                        return funs.render(tpl_name, hash, offset, ck);
                    }).catch((error) => {
                        return ck && ck({ error: "failed to init indexDB" });
                    });
                } else {
                    INDEXED.searchRows(db, config.table, "name", key, (res) => {
                        //console.log(res);
                        if (res.length !== 1) {
                            return funs.render(tpl_name, hash, offset, (bs64) => {
                                //here to update the iNFT local cache
                                const row = {
                                    name: key,
                                    stamp: tools.stamp(),
                                    thumb: bs64,
                                }
                                INDEXED.insertRow(db, config.table, [row]);
                                return ck && ck(bs64);
                            });
                        } else {
                            //here to return the result
                            return ck && ck(res[0].thumb);
                        }
                    });
                }
            });
        } else {
            return funs.render(tpl_name, hash, offset, ck);
        }
    },
    exsistFav:(name,ck)=>{
        const cfg = Config.get(["storage", "tables", fav_table]);
        INDEXED.checkDB(DBname, (db) => {
            const tbs = db.objectStoreNames;
            if (!funs.checkTable(fav_table, tbs)) {
                const tb = { table: fav_table, keyPath: cfg.keyPath, map: cfg.map }
                db.close();         //must close, or the DB is blocked
                INDEXED.initDB(DBname, [tb], db.version + 1).then((ndb) => {
                    return ck && ck(false,ndb);
                }).catch((error) => {       
                    return ck && ck(false,{error:"failed to fav"});
                });
            }else{
                INDEXED.searchRows(db,fav_table, "name", name, (res) => {
                    if(res.length!==0) return ck && ck(true,db);
                    return ck && ck(false,db);
                });
            }
        })
    },
}

const self = {
    enableLocal: () => {
        local = true;
    },
    disableLocal: () => {
        local = false;
    },
    fav:{
        exsist:(name,ck)=>{
            funs.exsistFav(name,(exsist,db)=>{
                return ck && ck(exsist);
            });
        },
        add: (name, block, address, ck) => {
            console.log(`Add ${name} to fav list.`);
            funs.exsistFav(name,(exsist,db)=>{
                if(exsist) return ck && ck({error:"Faved already."});
                const row={
                    name:name,
                    block:block,
                    address:address,
                    stamp:tools.stamp(),
                }
                return INDEXED.insertRow(db,fav_table,[row],ck);
            });
        },
        remove: (name, ck) => {
            console.log(`Remove ${name} from fav list.`);
            funs.exsistFav(name,(exsist,db)=>{
                if(!exsist) return ck && ck({error:"No such iNFT."});
                return INDEXED.removeRow(db,fav_table,"name",name,ck);
            });
        },
        list:(ck,page,step)=>{
            INDEXED.checkDB(DBname, (db) => {
                const tbs = db.objectStoreNames;
                if (!funs.checkTable(fav_table, tbs))return ck && ck({error:"no target "});
                INDEXED.pageRows(db, fav_table, ck,{ page: !page?1:page, step: !step?12:step});
            });
        },
    },
    
    

    /*  get the anchor list by name and block
    *   @param  {list}  array       //{name:ANCHOR_NAME,block:BLOCK}
    *   @param  {ck}    [function]  //
    *   @param  {done}  array       //result for loop
    */
    multi: (list, ck, done) => {
        if (!done) done = [];
        if (list.length === 0) return ck && ck(done);
        const single = list.pop();
        //console.log(JSON.stringify(single));
        const chain = Network("anchor");
        chain.view(single, "anchor", (dt) => {
            if(dt===false) return self.multi(list, ck, done);
            //console.log(JSON.stringify(single));
            dt.block = single.block;
            dt.blocknumber = single.block;
            done.push(dt);
            return self.multi(list, ck, done);
        });
    },

    single: (name, ck, normal) => {
        if (map[name]) return ck && ck(map[name]);
        if (!normal) {
            Network("anchor").view(name, "selling", (data) => {
                if (data === false) return ck && ck(false);

                const row = {
                    name: name,
                    owner: data[0],
                    price: data[1],
                    target: data[2],
                    free: data[0] === data[2],
                }
                self.auto([row], (res) => {
                    if (res) return ck && ck(res[0]);
                    return ck && ck(false);
                });
            });
        } else {
            Network("anchor").view(name, "owner", (data) => {
                //console.log(data);
                const row = {
                    name: name,
                    owner: data.address,
                    price: 0,
                    target: data.address,
                    free: false,
                }
                self.auto([row], (res) => {
                    if (res) return ck && ck(res[0]);
                    return ck && ck(false);
                });
            });
        }
    },
    overview: (ck) => {
        const tpls = [];
        let min = 0, max = 0;
        let first = true;
        for (var k in map) {
            const row = map[k];
            if (!row.price) continue;

            if (row.price > max) max = row.price;
            if (row.price < min || first) min = row.price;
            if (!tpls.includes(row.raw.tpl)) tpls.push(row.raw.tpl);
            first = false;
        }
        return ck && ck({
            template: tpls,
            range: [min, max],
        })
    },
    nav: (step) => {
        const sum = Object.keys(map).length;
        return {
            page: Math.ceil(sum / step),
            step: step,
            sum: sum,
        }
    },
    search: (val, type, ck) => {
        const result = [];
        switch (type) {
            case "template":
                for (var k in map) {
                    const row = map[k];
                    if (!row.price) continue;
                    const tpl = row.raw.tpl;
                    if (Array.isArray(val)) {
                        if (val.includes(tpl)) result.push(row);
                    } else {
                        if (val === tpl) result.push(row);
                    }
                }
                break;
            case "price":

                break;
            default:
                break;
        }
        return ck && ck(result);
    },
    /* get the thumb and cache
    *   @param  {list}  anchor[]       //anchor data array
    *   @param  {ck}    [function]      //
    *   @param  {final} [array]         //temp list, for loop
    */
    auto: (list, ck, final) => {
        if (!final) final = [];
        if (list.length === 0) return ck && ck(final);
        const single = list.pop();
        const key = single.name;
        if (map[key] !== undefined) {
            final.push(map[key]);
            return self.auto(list, ck, final);
        }

        const net = "anchor";
        if (single.raw && single.protocol && single.hash) {
            map[key] = single;
            const indexkey = `${key}_${!single.blocknumber ? single.block : single.blocknumber}`;
            funs.getThumb(single.raw.tpl, single.hash, single.raw.offset, (bs64) => {
                map[key].bs64 = bs64;
                if (local) map[key].local = true;
                final.push(map[key]);
                return self.auto(list, ck, final);
            }, indexkey);
        } else {
            const chain=Network(net);
            chain.view({ name: key }, "anchor", (data) => {
                if (!data || !data.name) return self.auto(list, ck, final);
                chain.view(data.block, "hash", (hash) => {
                    data.price = single.price===undefined?0:single.price;
                    data.free = single.free===undefined?false:single.free;
                    data.target = single.target===undefined?"":single.target;
                    if (!data.Network) data.network = net;         //add default network settling
                    data.hash = hash;

                    map[key] = data;

                    const indexkey = `${key}_${!data.blocknumber ? data.block : data.blocknumber}`;
                    funs.getThumb(data.raw.tpl, data.hash, data.raw.offset, (bs64) => {
                        //console.log(`Rending done:${key}`);
                        map[key].bs64 = bs64;
                        if (local) map[key].local = true;
                        final.push(map[key]);
                        return self.auto(list, ck, final);
                    }, indexkey);
                });
            });
        }
    },
}

export default self;