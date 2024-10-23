import INDEXED from "../lib/indexed";
import tools from "../lib/tools";

import Config from "./config";
import Network from "../network/router";

const cache={}      //cache the account

const funs = {
    checkDB:(table,ck)=>{
        const cfg = Config.get(["storage"]);
        INDEXED.checkDB(cfg.DBname, (db) => {
            const tbs = db.objectStoreNames;
            if (!funs.checkTable(table, tbs)) {
                const tb = tools.clone(cfg.tables[table]);
                tb.table=table;
                db.close();         //must close, or the DB is blocked
                INDEXED.initDB(cfg.DBname, [tb], db.version + 1).then((ndb) => {
                    return ck && ck(ndb);
                }).catch((error) => {
                    return ck && ck({ error: "failed to init indexDB" });
                });
            } else {
               return ck && ck(db);
            }
        });
    },
    checkTable: (from, list) => {
        for (let i = 0; i < list.length; i++) {
            if (list[i] === from) return true;
        }
        return false;
    },
    randomPassword: (len) => {
        const n = !len ? 16 : len;
        return tools.char(n);
    },
    insertToDB: (row, ck) => {
        const table="accounts";
        funs.checkDB(table,(db)=>{
            INDEXED.insertRow(db, table, [row],ck);
        });
    }
}


const self = {
    map:(ck)=>{
        self.list({},(arr)=>{
            for(let i=0;i<arr.length;i++){
                const row=arr[i];
                cache[row.address]=true;
            }
            return ck && ck();
        });
    },
    get:(addr,ck)=>{
        const table="accounts";
        funs.checkDB(table,(db)=>{
            INDEXED.searchRows(db,table,"address",addr,ck);
        });
    },
    exsist:(addr)=>{
        if(cache[addr]) return true;
        return false
    },

    list: (filter, ck, page, step) => {
        const table="accounts";
        funs.checkDB(table,(db)=>{
            INDEXED.pageRows(db,table,ck,{page:page,step:step})
        });
    },

    generate: (network, ck) => {
        const gen = Network(network);
        if (gen === false) return ck && ck(false);
        const pass = funs.randomPassword();

        gen.generate(pass, (row) => {

            //1.saving the password to config
            Config.set(["account", "password", row.address], pass);

            //2.insert the address data to indexedDB
            row.stamp = tools.stamp();
            funs.insertToDB(row, (res) => {
                console.log(res);
            });
        });
    },

    import:(pass,row,ck)=>{
        //console.log(pass,row);
        //0.check wether loaded;

        //1.saving the password to config
        Config.set(["account", "password", row.address], pass);

        //2.insert the address data to indexedDB
        row.stamp = tools.stamp();
        funs.insertToDB(row, (res) => {
            console.log(res);
            return ck && ck();
        });
    },
    
    balance:(list,ck,net)=>{
        const chain = Network(!net?"anchor":net);
        const div=chain.divide();
        if(Array.isArray(list)){
            let working=0;
            const map={};
            for(let i=0;i<list.length;i++){
                const address=list[i];
                working++;
                chain.balance(address,(res)=>{
                    console.log(res);
                    working--;
                    map[address]=parseFloat(parseInt(res.free)/div);
                    if(working<1) return ck && ck(map);
                });
            }
        }else{
            chain.balance(list,ck);
        }
    },
}

export default self;