import Local from "./local";
import tools from "./tools";
import Render from "./render";
import TPL from "./tpl";

//This is the lib for iNFT local, cache all data including the filter queue
//!important, page starts from 0 here;
//!important, "raw" save the data the same as Localstorage, then the thumbs are cached on "imgs"


let raw=[];         //raw list of iNFT, copy of localstorage data
const map={};       //iNFT kv cache;  {name:"INDEX_IN_RAW"}
const imgs={};      //images cache by name, big one.
const filter={      //iNFT filter list page     
    fav:[],                 //fav list
    selling:[],             //selling list
    template:{},            //template list by hash
    other:{},
};

const config={
    prefix_length:11,
    step:9,               //default step of a page 
}

const funs={
    getDay:()=>{
        const dt = new Date();
        const year = dt.getFullYear();
        const month = String(dt.getMonth() + 1).padStart(2, "0");
        const day = String(dt.getDate()).padStart(2, "0");
        return `${year}${month}${day}`;
    },
    getBasic:()=>{
        return {
            index:0,
            pre:`i${tools.char(config.prefix_length).toLocaleLowerCase()}`,
            stamp:tools.stamp(),
            task:[],                //task of last mint
            history:{},             //record daily mint history by anchor name
            template:{},
            proxy:true,             //wether proxy
        }
    },
    getAddress:()=>{
        const fa = Local.get("login");
        if(!fa) return false;
        try {
            const user=JSON.parse(fa);
            return user.address;
        } catch (error) {
            return false;
        }
    },
    getINFTMintDetail:(addr)=>{
        const mm = Local.get("mint");
        if(!mm){
            const ps={}
            ps[addr]=funs.getBasic();
            Local.set("mint",JSON.stringify(ps));
            return ps[addr];
        }

        try {
            const mints=JSON.parse(mm);
            if(!mints[addr]){
                mints[addr]=funs.getBasic();
                Local.set("mint",JSON.stringify(mints));
            } 
            return mints[addr];
        } catch (error) {
            Local.remove("mint");
            const ps={}
            ps[addr]=funs.getBasic();
            Local.set("mint",JSON.stringify(ps));
            return ps[addr];
        }
    },

    isFilter:(cfg)=>{
        if(!cfg) return false;
        if(!cfg.fav && !cfg.template && !cfg.selling) return false;
        return true;
    },

    getNav:(cfg,page,step)=>{

        const nav={
            from:null,      //filter key pointer. such as "fav" or ["template",CID]
            start:0,        //index of start
            end:0,          //index of end
            sum:0,          //page sum
            total:0,        //total result
            empty:true      //wether data
        };

        if(!funs.isFilter(cfg)){
            //no filter, just get the list of raw
            const len=raw.length;
            if(!!len){
                nav.total=len;
                nav.sum=Math.ceil(len/step);
                nav.start=(page-1)*step;
                nav.end=page*step;
                nav.empty=false;
            }
        }else{
            if(cfg.fav){
                const len=filter.fav.length;
                if(!!len){
                    nav.from="fav";
                    nav.total=len;
                    nav.sum=Math.ceil(len/step);
                    nav.start=(page-1)*step;
                    nav.end=page*step;
                    nav.empty=false;
                }
            }
        }
        
        return nav;
    },

    getINFT:(name, tpl, hash, block, creator,offset,network)=>{
        return {
            anchor: name,
            hash: hash,
            offset:offset,
            block: block,
            template: {
                hash: tpl,
                type: "ipfs",            //storage way
                origin: "web3.storage",   //storage origianl
            },
            network: network,
            creator: creator,
            fav: false,                  //wether faved
            stamp: tools.stamp(),
        }
    },

    /* Create thumbs of iNFTs
     * @param  integer[]    list    //list of iNFT index of "raw"
     * @param  function     ck      //callback
     */
    getThumb:(list,ck)=>{
        if(list.length===0) return ck && ck(true);
        const ii=list.pop();
        const me=raw[ii];
        //console.log(iNFT.template.hash);
        TPL.view(me.template.hash,(dt)=>{
            if(dt===false) return funs.getThumb(list,ck); 
            const basic = {
                cell: dt.cell,
                grid: dt.grid,
                target: dt.size
            }
            Render.thumb(me.hash,dt.image,dt.parts, basic,me.offset,(bs64)=>{
                imgs[me.anchor]=bs64;
                return funs.getThumb(list,ck);
            });
        });
    },
    autoThumb:(list,ck)=>{
        //1.get the templates;
        const tpls=[];
        for(let i=0;i<list.length;i++){
            const index=list[i];
            const cid=raw[index].template.hash;
            if(!tpls.includes(cid)) tpls.push(cid);
        }
        
        TPL.cache(tpls,(dels)=>{
            return funs.getThumb(list,ck);
        });
    },
    getData:(start,end,from,ck)=>{
        //1. find the indexs of iNFT list
        const arr=[];
        const uncached=[];
        for(let i=start;i<end;i++){
            if(from===null){
                if(!raw[i]) continue;
                const single=tools.clone(raw[i]);
                if(!imgs[single.anchor]){
                    uncached.push(i);
                }
                arr.push(single);
            }else{
                const index=Array.isArray(from)?filter[from[0]][from[1]][i]:filter[from][i];
                if(index===undefined || !raw[index]) continue;
                const single=tools.clone(raw[index]);
                if(!imgs[single.anchor]){
                    uncached.push(index);
                }
                arr.push(single);
            }
        }

        //2. get the thumbs of iNFT
        if(uncached.length===0){
            for(let i=0;i<arr.length;i++){
                arr[i].thumb=imgs[arr[i].anchor];
            }
            return ck && ck(arr);
        }
        
        funs.autoThumb(uncached,(done)=>{
            if(done===false) return ck && ck({error:`Failed to create thumb for iNFTs.`});
            for(let i=0;i<arr.length;i++){
                arr[i].thumb=imgs[arr[i].anchor];
            }
            return ck && ck(arr);
        });
    },

    getRaw:(addr)=>{
        const ls = Local.get("list");
        if(!ls) return [];
        try {
            const ns=JSON.parse(ls);
            if(!ns[addr]) return [];
            return ns[addr];
        } catch (error) {
            return [];
        }
    },
    cache:(addr)=>{
        //funs.init();
        raw = funs.getRaw(addr);
        return true;
    },

    analysis:()=>{
        for(let i=0;i<raw.length;i++){
            const row=raw[i];
            map[row.anchor]=i;

            if(row.fav) filter.fav.push(i);

            const tpl=row.template.hash;
            if(!filter.template[tpl]) filter.template[tpl]=[];
            filter.template[tpl].push(i);
        }
        return true;
    },
    init:()=>{     //reset cache
        //backup=[];
        raw=[];
        filter.fav=[];
        filter.selling=[];
        filter.template={};
        filter.other={};
    },
}

const self = {
    auto:()=>{
        //0. reset the iNFT data;
        funs.init();

        //1.cache all localstorage data to cache
        const addr=funs.getAddress();
        if(!addr) return false;
        if(funs.cache(addr)) funs.analysis();

        //2.cache basic setting of mint
        funs.getINFTMintDetail(addr);
    },

    list:(page,step,ck,filter_cfg)=>{
        const addr=funs.getAddress();
        if(!addr) return ck && ck(false);

        const nav=funs.getNav(filter_cfg,page,step);
        if(nav.empty) return ck && ck({data:[],nav:nav});

        funs.getData(nav.start,nav.end,nav.from,(list)=>{
            return ck && ck({data:list,nav:nav});
        });
    },

    update:()=>{        //update the iNFT list on localstorage
        const key="list";
        const addr=funs.getAddress();
        if(!addr) return false;
        const ls = Local.get(key);
        try {
            const ns=JSON.parse(ls);
            ns[addr]=raw;
            Local.set(key,JSON.stringify(ns));
            self.auto();
            return true;
        } catch (error) {
            Local.remove(key);
            const ps={};
            ps[addr]=raw;
            Local.set(key,JSON.stringify(ps));
            return true;
        }
    },
    thumbs:(names,ck,imap)=>{
        if(!imap) imap={};
        if(names.length===0) return ck && ck(imap);
        const name=names.pop();
        
        if(imgs[name]!==undefined){
            imap[name]=imgs[name];
            return self.thumbs(names,ck,imap);
        }

        if(!map[name]) return self.thumbs(names,ck,imap);
        const index=map[name];
        const single=raw[index];
        return funs.getThumb(single,(bs64)=>{
            imap[name]=bs64;    
            imgs[name]=bs64;        //set to cache 
            return self.thumbs(names,ck,imap);
        });
    },
    single:{    //single iNFT functions here.
        fav:(name)=>{
            if(map[name]===undefined) return false
            const index=map[name];
            raw[index].fav=true;
            return self.update();           
        },
        unfav:(name)=>{
            if(map[name]===undefined) return false
            const index=map[name];
            raw[index].fav=false;
            return self.update();
        },
        selling:(name,price,target)=>{
            if(map[name]===undefined) return false
            const index=map[name];
            if(!raw[index].market) raw[index].market={price:0,target:""};
            raw[index].market.price=price;
            if(target!==undefined) raw[index].target=target;
            return self.update();
        },
        revoke:(name)=>{
            if(map[name]===undefined) return false
            const index=map[name];
            if(!raw[index].market) return false;
            raw[index].market.price=0;
            raw[index].market.target="";
            return self.update();
        },
        target:(name)=>{
            if(map[name]===undefined) return false
            const index=map[name];
            return raw[index];
        },
        add:(name, tpl_cid, hash, block, creator,offset,network)=>{
            const single=funs.getINFT(name, tpl_cid, hash, block, creator,offset,network);
            raw.unshift(single);
            return self.update();
        }   
    },
    mint:{
    
        //get current task
        detail:(key)=>{
            const addr=funs.getAddress();
            if(!addr) return false;
            const data=funs.getINFTMintDetail(addr);
            if(key!==undefined){
                if(!data[key]) return false;
                return data[key];
            }
            return data;
        },
        status:()=>{
            return self.mint.detail();
        },
        update:(obj)=>{
            const key="mint";
            const addr=funs.getAddress();
            if(!addr) return false;
            const mm = Local.get(key);
            try {
                const mints=JSON.parse(mm);
                for(var k in mints[addr]){
                    if(obj[k]!==undefined) mints[addr][k]=obj[k];
                }
                Local.set(key,JSON.stringify(mints));
                return true;
            } catch (error) {
                Local.remove(key);
                funs.getINFTMintDetail(addr);       //reset the localstorage
                return true;
            }
        },
    },
}

export default self;