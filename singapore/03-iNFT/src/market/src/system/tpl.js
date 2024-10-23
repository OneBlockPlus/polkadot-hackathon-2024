import Local from "../lib/local";
import Data from "../lib/data";
import IPFS from "../network/ipfs";
import Render from "../lib/render";
import tools from "../lib/tools";
import INDEXED from "../lib/indexed";

const config = {
    default: "bafkreiddy2rqwebw5gm5hdqqqrbsqzkrubjk3ldzr2bia5jk4w5o2w5w4i",
    indexDB: "inftDB",
    table: "template",
    keypath: "cid",
    map: {
        cid: { unique: true },
        stamp: { unique: false },
        thumb: { unique: false },
        image: { unique: false },
        content: { unique: false },
    },
}

let agent = false;     //wether use agent
let local = true;     //get template from local
const funs = {
    checkTable: (from, list) => {
        for (let i = 0; i < list.length; i++) {
            if (list[i] === from) return true;
        }
        return false;
    },
    getLocal: (alinks, ck, left) => {
        if (left === undefined) left = [];
        if (alinks.length === 0) return ck && ck(left);

        INDEXED.checkDB(config.indexDB, (db) => {
            const tbs = db.objectStoreNames;
            if (!funs.checkTable(config.table, tbs)) {
                //no indexDB, init it
                db.close();
                const tb = { table: config.table, keyPath: config.keypath, map: config.map }
                INDEXED.initDB(config.indexDB, [tb], db.version + 1).then((ndb) => {
                    return ck && ck(tools.copy(alinks));
                }).catch((error) => {
                    return ck && ck({ error: "failed to init indexDB" });
                });
            } else {
                //console.log(`Here to search the templates.`);
                const single = alinks.pop();
                INDEXED.searchRows(db, config.table, "cid", single, (res) => {
                    if (res.length !== 1) {
                        left.push(single);
                        return funs.getLocal(alinks, ck, left)
                    } else {
                        const itpl = funs.getTemplateFromLocal(res[0]);
                        Data.setHash("cache", single, itpl);
                        return funs.getLocal(alinks, ck, left)
                    }
                });
            }
        });
    },
    getTemplateFromLocal: (data) => {
        const dt = data.content;
        dt.thumb = data.thumb;
        dt.image = data.image;
        dt.cid = data.cid;
        dt.indexDB = true;        //mark the data is from local
        return dt;
    },
    formatContent: (ctx) => {
        console.log(ctx);
        return {
            parts: tools.copy(ctx.parts),
            size: tools.copy(ctx.size),
            grid: tools.copy(ctx.grid),
            cell: tools.copy(ctx.cell),
            series: tools.copy(ctx.series),
            type: ctx.type,
            version: ctx.version,
        }
    },
    cacheIPFS: (alinks, ck, dels) => {
        if (dels === undefined) dels = [];
        if (alinks.length === 0) return ck && ck(dels);
        const single = alinks.pop();
        if (Data.exsistHash("cache", single)) {
            return funs.cacheIPFS(alinks, ck, dels);
        } else {
            return IPFS.read(single, (ctx) => {
                if (!ctx || ctx.error !== undefined) {
                    const left = alinks.length;
                    dels.push(left);
                    return funs.cacheIPFS(alinks, ck, dels);
                } else {
                    Data.setHash("cache", single, ctx);

                    //1.get the thumb of template
                    //const mock="0x0000000000000000000000000000000000000000000000000000000000000000";
                    const mock = funs.getHashBySelected();
                    funs.thumb(mock, ctx, single, (bs64) => {
                        ctx.thumb = bs64;
                        const mks = funs.getSeriesMock(ctx.parts, ctx.series);

                        //2.get the series thumbs;
                        //bafkreibtt7ciqypa3vogodmdmvyd3trwajv3l7cqi43yk4hrtgpyopn2e4
                        if (mks !== false) {
                            let count = 0;
                            for (let i = 0; i < mks.length; i++) {
                                ctx.series[i].count = mks[i].count
                                ctx.series[i].mock = mks[i].mock;
                                ctx.series[i].thumb = [];

                                for (let j = 0; j < mks[i].mock.length; j++) {
                                    const smock = mks[i].mock[j];
                                    count++;
                                    funs.thumb(smock, ctx, single, (simage) => {
                                        ctx.series[i].thumb.push(simage);
                                        count--;
                                        if (count === 0) {
                                            if (local) {
                                                //console.log(`Ready to cache to local indexDB.`);
                                                INDEXED.checkDB(config.indexDB, (db) => {
                                                    //console.log(db);
                                                    const row = {
                                                        cid: single,
                                                        stamp: tools.stamp(),
                                                        thumb: bs64,
                                                        image: ctx.image,
                                                        content: funs.formatContent(ctx),
                                                    }
                                                    //console.log(row);
                                                    INDEXED.insertRow(db, config.table, [row]);
                                                });
                                            }
                                            return funs.cacheIPFS(alinks, ck, dels);
                                        }
                                    });
                                }
                            }
                        } else {
                            return funs.cacheIPFS(alinks, ck, dels);
                        }
                    });
                }
            }, agent);
        }
    },
    autosetTemplate: () => {
        const list = self.list();
        if (list === false) return false;
        const active = list[0];
        const def = Data.getHash("cache", active.alink);
        if (!def) return false;
        def.cid = active.alink;
        Data.set("template", def);
        return true;
    },
    getFormat: (cid) => {
        return {
            alink: cid,
            name: "",
            offset: [],              //customized offset value
            tags: []
        }
    },
    getPartsArray: (index, parts) => {
        const arr = [];
        for (let i = 0; i < parts.length; i++) {
            const row = parts[i];
            if (!row.rarity || !row.rarity[index]) return false;
            const rare = row.rarity[index];
            arr.push(rare);
        }
        return arr;
    },
    countSeries: (arr) => {
        let count = 1;
        for (let i = 0; i < arr.length; i++) count = count * arr[i].length;
        return count;

    },
    getPlainMatrix: (matrix, arr) => {
        if (arr === undefined) arr = [];
        if (matrix.length === 0) return arr;

        const atom = matrix.shift();
        if (arr.length === 0) {
            arr = JSON.parse(JSON.stringify(atom));
        } else {
            const narr = [];
            for (let j = 0; j < arr.length; j++) {
                for (let i = 0; i < atom.length; i++) {
                    narr.push(`${arr[j]}_${atom[i]}`);
                }
            }
            arr = narr;
        }
        return funs.getPlainMatrix(matrix, arr);
    },
    getHashBySelected: (selected, parts) => {
        let mock = "0x0000000000000000000000000000000000000000000000000000000000000000";
        if (!selected || !parts || selected.length !== parts.length) return mock;
        for (let i = 0; i < selected.length; i++) {
            const part = parts[i];
            const value = selected[i];
            const [start, step, divide, offset] = part.value;
            const mk = parseInt(divide) + parseInt(offset) + parseInt(value);
            const replace = tools.toHex(mk, step);
            const head_str = mock.substr(0, start + 2)
            const tail_str = mock.substr(2 + start + step);
            mock = `${head_str}${replace}${tail_str}`;
        }
        return mock;
    },
    getHashesFromMatrix: (matrix, parts) => {
        const max = 4;
        const ms = funs.getPlainMatrix(matrix);
        const hs = [];
        if (ms.length > max) {
            for (let i = 0; i < max; i++) {
                const st = ms[i].split("_");
                const hash = funs.getHashBySelected(st, parts);
                hs.push(hash);
            }
        } else {
            for (let i = 0; i < ms.length; i++) {
                const st = ms[i].split("_");
                const hash = funs.getHashBySelected(st, parts);
                hs.push(hash);
            }
        }
        return hs;
    },
    getSeriesMock: (parts, series) => {
        if (!series || series.length === 0 || parts.length === 0) return false;
        const arr = [];
        for (let i = 0; i < series.length; i++) {
            const row = series[i];
            const matrix = funs.getPartsArray(i, parts);
            const count = funs.countSeries(matrix);
            const hashes = funs.getHashesFromMatrix(matrix, parts);
            arr.push({ mock: hashes, count: count });                //output the mock hashes and count
        }
        return arr;
    },
    thumb: (mock, tpl, cid, ck) => {
        const basic = {
            cell: tpl.cell,
            grid: tpl.grid,
            target: tpl.size
        };
        Render.thumb(mock, tpl.image, tpl.parts, basic, [], (bs64) => {
            // const def=Data.getHash("cache", cid);
            // def.thumb=bs64;
            return ck && ck(bs64);
        });
    },
}

const self = {
    enableLocal:()=>{
        local=true;
    },
    disableLocal:()=>{
        local=false;
    },
    setAgent: (enable) => {
        agent = enable;
    },
    auto: (ck, only_first) => {
        const list = self.list(true);
        if (list === false) {
            return self.add(config.default, self.auto);
        } else {
            funs.cacheIPFS(only_first ? [list[0]] : list, (dels) => {
                //1. need to remove the dels templates
                if (dels.length !== 0) {
                    console.log(`Need to remove invalid templates.`);
                }

                //2. set template cache
                funs.autosetTemplate();

                return ck && ck(dels);
            });
        }
    },
    cache: (alinks, ck) => {
        if (local) {
            funs.getLocal(alinks, (left) => {
                console.log(left);
                return ck && ck(left);
            });
        } else {
            funs.cacheIPFS(alinks, (dels) => {
                return ck && ck(dels);
            });
        }

    },
    current: (only_cid) => {
        const tpl = Data.get("template");
        if (tpl === null) return tpl;
        if (only_cid) return tpl.cid;
        return tpl;
    },
    list: (only_cid) => {  //if only_cid=true, filter out the cid from templates.
        const tpls = Local.get("template");
        if (!tpls) return false;
        try {
            const nlist = !tpls ? [] : JSON.parse(tpls);
            if (only_cid) {
                const arr = [];
                for (let i = 0; i < nlist.length; i++) {
                    arr.push(nlist[i].alink);
                }
                return arr;
            } else {
                return nlist;
            }

        } catch (error) {
            return false;
        }
    },
    view: (cid, ck) => {
        //console.log(cid,Data.exsistHash("cache",cid));
        if (!Data.exsistHash("cache", cid)) {
            if (local) {
                //check wether local cache
                funs.getLocal([cid], (left) => {
                    if (left.length !== 0) {
                        funs.cacheIPFS(left, (dels) => {
                            if (dels.length !== 0) {
                                return ck && ck(false);
                            } else {
                                return self.view(cid, ck);
                            }
                        });
                    } else {
                        const tpl = Data.getHash("cache", cid);
                        return ck && ck(tpl);
                    }
                });
            } else {
                funs.cacheIPFS([cid], (dels) => {
                    if (dels.length !== 0) {
                        return ck && ck(false);
                    } else {
                        return self.view(cid, ck);
                    }
                });
            }
        } else {
            const tpl = Data.getHash("cache", cid);
            return ck && ck(tpl);
        }
    },
    target: (index) => {       //get local storaged template information
        const tpls = self.list();
        if (tpls === false || tpls.length === 0) return false;
        const order = !index ? 0 : index;
        if (!tpls[order]) return false;
        return tpls[order];
    },
    remove: (index) => {
        const arr = self.list();
        const nlist = [];
        for (let i = 0; i < arr.length; i++) {
            if (index !== i) nlist.push(arr[i]);
        }
        Local.set("template", JSON.stringify(nlist));
    },
    change: (index) => {
        const arr = self.list();
        const nlist = [arr[index]];
        for (let i = 0; i < arr.length; i++) {
            if (index !== i) nlist.push(arr[i]);
        }
        Local.set("template", JSON.stringify(nlist));
    },
    add: (cid, ck, head) => {
        console.log(`Ready to add template`);
        //check data from IPFS first
        self.view([cid], (dt) => {
            if (!dt) return ck && ck(false);
            const narr = self.list();

            //1.check wether here
            const arr = [];
            for (let i = 0; i < narr.length; i++) {
                const row = narr[i];
                if (row.alink !== cid) arr.push(row);
            }
            const ntpl = funs.getFormat(cid);
            head ? arr.unshift(ntpl) : arr.push(ntpl);
            Local.set("template", JSON.stringify(arr));

            return ck && ck(true);
        });
    },
    clean: () => {
        Local.remove("template");
    },
    reset: (ck) => {
        IPFS.reset();               //clean IPFS cache
        Data.reset(true);               //clean template cache
        self.auto(ck, true);         //relink 
    },
}

export default self;