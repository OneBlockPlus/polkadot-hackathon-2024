/* 
*  PFS lib ( web3.storage )
*  @auth [ Fuu ]
*  @creator Fuu
*  @date 2024-05-15
*  @functions
*  1.Read files from web3.storage
*  2.Proxy support
*/

const map={}

const config={
    protocol:"https://",
    gateway:".ipfs.w3s.link",
    proxy:"https://ipfs.w3os.net",
}

const self={
    getURL:(cid,proxy)=>{
        if(proxy) return `${config.proxy}/${cid}`;
        return `${config.protocol}${cid}${config.gateway}`;
    },
    read:async (cid,ck,proxy)=>{
        if(!cid) return ck && ck(true);
        const url=self.getURL(cid,proxy);
        console.log(url);

        //if there is cache, return a copy of it;
        if(map[cid]!==undefined) return JSON.parse(JSON.stringify(map[cid])); 
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                return ck && ck({error:"Network response was not ok"});
            }
            const ctx = await response.text();
            // return ck && ck(ctx);

            try {
                const json=JSON.parse(ctx);
                map[cid]=json;
                return ck && ck(json);
            } catch (error) {
                return ck && ck({error:"Invalid JSON IPFS file."});
            }

          } catch (error) {
            return ck && ck({error:error});
          }
    },
    write:(data,ck)=>{

    },
    reset:()=>{
        for(var k in map) delete map[k];
        return true;
    },
}

export default self;