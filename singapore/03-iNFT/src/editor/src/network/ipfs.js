import ipfsHttpClient from "ipfs-http-client";

//cache to the target files.
const map={}
let link=null;

const config={
    node:"localhost",
    port:"5001",
}

const self={
    init:(ck)=>{
        if(link!==null) return ck && ck(link);
        link=ipfsHttpClient(config.node,config.port);
        return ck && ck(link);
    },
    read:(cid,ck)=>{
        self.init((connection)=>{
            connection.cat(cid,(error,res)=>{
                if(error!==undefined) return ck && ck(error);
                return ck && ck(res);
            });
        });
    },
}

export default self;