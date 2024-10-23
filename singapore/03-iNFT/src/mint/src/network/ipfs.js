//1.This is a lib to get IPFS template from gateway directly.
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
        //const url=`${config.protocol}${cid}${config.gateway}`;
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