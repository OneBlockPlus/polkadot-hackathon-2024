import tools from "../lib/tools";
import Encry from "../lib/encry";

//using account address (password optional) to encry the setting to localstorage
const metadata={
    address:"",
    pass:"",
}
let cache=null;         //setting cache, if no setting, keep null

const config={
    system:{        //this part will be written to localstorage
        name:"iNFT Market",         //dApp name needed for wallet
        prefix:"imxt",              //prefix of localstorage
        key:"local_setting",        //default local setting key
        avatar:{
            base:"https://robohash.org",
            set:"?set=set2",
        },
        enable:{
            password:false,         //enable local setting password,
            startup:false,          //wether check the system when startup
        },
        status:{            //network status
            1:"normal",
            2:"trying",
            4:"failed",
            9:"unknown",        //unknow network status
            13:"error",         //no such url           
        },
        explorer:[
            {
                domain:"https://polkadot.js.org/apps/",
                rpc:"rpc=",
                query:"explorer/query/",
            }
        ]
    },
    bounty:{
        approver:{                  //accounts to accept bounty coins
            anchor:"",
            tanssi:"",
        },
    },
    account:{
        password:{                  //password to encry the private key, address --> password

        },
        single:"",                  //if one password, saving here.                
        enable:{
            oneforall:true,         //one password to encry all private key by AES
        },
    },
    runtime:{
        template:{
            default:"bafkreiddy2rqwebw5gm5hdqqqrbsqzkrubjk3ldzr2bia5jk4w5o2w5w4i",
            orgin:"web3.storage",
        }
    },
    storage:{     
        DBname:"inftDB",
        password:"",                //password for image cache
        enable:{
            template:true,          //enable cache template
            iNFT:true,              //enable cache iNFT thumb
            encry:false,            //wether encry the image bs64 data
        },
        tables:{
            template:{
                keyPath: "cid",
                map: {
                    cid: { unique: true },
                    stamp: { unique: false },
                    thumb: { unique: false },
                    image: { unique: false },
                    content: { unique: false },
                },
                step:10,
            },
            infts:{
                keyPath:"name",
                map:{
                    name: { unique: true },
                    stamp: { unique: false },
                    thumb: { unique: false },
                },
            },
            accounts:{               //storage encried private key, the password are storage on setting
                keyPath:"address",
                map:{
                    address: { unique: true },
                    network: { unique: false },
                    encoded: {unique: false },      //encried private key
                    stamp: { unique: false },
                    metadata: { unique: false },
                }, 
            },
            bounty:{                //bounty storaged on local
                keyPath:"name",
                map:{
                    name:{ unique: true },
                    title:{ unique: false },
                    desc:{ unique: false },
                    publisher: { unique: false },
                    payer:{unique: false},
                    start:{unique: false},
                    end:{unique: false},
                    coin:{unique: false},
                    status:{unique: false},
                },
            },
            apply:{             //bounty apply data
                keyPath:"alink",
                map:{
                    alink:{ unique: true },
                    status:{unique: false},
                    receiver:{unique: false},
                },
            },      
            ifav:{               //fav list on local 
                keyPath:"name",
                map:{
                    name:{ unique: true },
                    address:{unique: false},
                    block:{unique: false},
                    stamp:{unique: false},
                },
            },
        },
    },
    proxy:{             //all agent url here
        enable:{
            cache:false,        //get iNFT data from proxy server   
        },
        nodes:{
            market:[
                {
                    domain:"localhost/iNFT/service/api/",
                    protocol:"http://",
                    partten:"php",
                    orgin:"W3OS",

                    lang:"php",
                    desc:"",
                    funs:"",
                    def:"",                 //get the definition of API (JSON format)
                }
            ],
            ipfs:[
                {
                    domain:"ipfs.w3os.net",
                    protocol:"https://",
                    partten:"path",             // {protocol}{domain}/{cid}
                    orgin:"w3os.net",
                },
                {
                    domain:"ipfs.w3s.link",
                    protocol:"https://",
                    partten:"subdomain",        // {protocol}{cid}.{domain}
                    orgin:"web3.storage",
                },
            ],
            bitcoin:[
                {}
            ],
            ethereum:[
                {}
            ],
            price:[
                {}
            ],
        },
    },
    network:{
        anchor:{
            coin:"ANK",
            enable:true,
            support:{
                minting:true,
                template:true,
                bonus:true,
            },
            nodes:[
                "ws://localhost:9944",
                "wss://dev2.metanchor.net",
            ],
            interval:3000,
            wallet:[
                {
                    name:"subwallet",
                    icon:"",
                }
            ],
            test:{},
        },
        tanssi:{
            coin:"INFT",
            enable:true,
            support:{
                minting:true,
                template:true,
                bonus:false,
            },
            nodes:[
                "wss://fraa-flashbox-2690-rpc.a.stagenet.tanssi.network"
            ],
            interval:12000,
            wallet:[
                {
                    name:"subwallet",
                    icon:"",
                }
            ],
        },
        polkadot:{
            coin:"DOT",
            enable:false,
            support:{
                minting:false,
                template:false,
                bonus:true,
            },
            nodes:[
                "",
            ],
            interval:3000,
            wallet:[
                {
                    name:"subwallet",
                    icon:"",
                }
            ],
        },
        solana:{
            coin:"SOL",
            enable:true,
            support:{
                minting:true,
                template:true,
                bonus:true,
            },
            nodes:[
                "",
            ],
            interval:3000,
            wallet:[
                {
                    name:"phantom",
                    icon:"",
                }
            ],
        },
        aptos:{
            coin:"APTOS",
            enable:false,
            support:{
                minting:true,
                template:true,
                bonus:true,
            },
            nodes:[     //check network type by node URL 
                ""
            ],
            interval:3000,
            wallet:[
                {
                    name:"petra",
                    icon:"",
                }
            ],
        },
        sui:{
            coin:"SUI",
            enable:false,
            support:{
                minting:true,
                template:true,
                bonus:true,
            },
            nodes:[
                ""
            ],
            interval:3000,
            wallet:[
                {
                    name:"sui",
                    icon:"",
                }
            ],
        },
        bitcoin:{
            coin:"BTC",
            enable:false,
            support:{
                minting:false,
                template:false,
                bonus:true,
            },
            nodes:[
                ""
            ],
            interval:240000,
            wallet:[
                {
                    name:"",
                    icon:"",
                }
            ],
        },
        ethereum:{
            coin:"ETH",
            enable:false,
            support:{
                minting:false,
                template:false,
                bonus:true,
            },
            nodes:[
                ""
            ],
            interval:60000,
            wallet:[
                {
                    name:"metamask",
                    icon:"",
                }
            ],
        },
    },
    version:202401,             //setting version
}

const funs={
    /*  Set the account to check setting 
    * @param  {string}  addr     //account to get setting
    */
    set:(addr,pass)=>{
        if(addr) metadata.address=addr;
        if(pass) metadata.pass=pass;
        return true;
    },

    //get the setting key by 
    getSettingKey:(addr,pass)=>{
        if(!addr && !pass) return `${config.system.prefix}_${config.system.key}`;
        if(addr && !pass) return `${config.system.prefix}_${Encry.sha256(addr)}`;
        if(addr && pass) return config.system.prefix+"_"+Encry.sha256(`${addr}${pass}`);
        return `${config.system.prefix}_${config.system.key}`;
    },
    decodeData:(raw,addr,pass)=>{
        const offset=Encry.md5(!pass?addr:(addr+pass));
        Encry.auto(offset);
        return Encry.decrypt(raw);
    },
    encodeData:(raw,addr,pass)=>{
        const offset=Encry.md5(!pass?addr:(addr+pass));
        Encry.auto(offset);
        return Encry.encrypt(raw);
    },
}

//test demo
const test={
    test_init:()=>{
        const addr="5D5K7bHqrjqEMd9sgNeb28w9TsR8hFTTHYs6KTGSAZBhcePg";
        const pass=Encry.md5("555666"+addr);
        self.init((data)=>{
            self.set(["system","name"],"my test system",true);
            console.log(self.get());
        },addr,pass);
    },
}

const self={

    /* check wether setting encried localstorage
    *   @param  {string}     [addr]     //manage account
    *   @param  {string}     [pass]     //encry password
    */
    exsist:(addr,pass)=>{
        const key=funs.getSettingKey(addr,pass);
        const data=localStorage.getItem(key);
        return  data===null;
    },

    /*get the setting
    * @param    {function}  ck      //callback
    * @param    {string}    [addr]  //address to get setting
    * @param    {string}    [pass]  //password to get setting
    * return
    *   {object}  setting object
    */
    init:(ck,addr,pass)=>{
        funs.set(addr,pass);
        const status={
            first:true,
            msg:"null",
        }
        //1.check wether setting data
        const key=funs.getSettingKey(addr,pass);
        //console.log(key);
        const data=localStorage.getItem(key);
        if(data===null){
            cache=tools.clone(config);      //set default setting
            return ck && ck(status);
        }

        //2.decode encry setting;
        const str=funs.decodeData(data,addr,pass);
        if(!str){
            status.first=false;
            status.message="Invalid password or manage account.";
            cache=tools.clone(config);      //set default setting
            return ck && ck(status);
        }
        try {
            const cfg=JSON.parse(str);
            cfg.stamp=tools.stamp();        //leave a stamp to 
            cache=tools.clone(cfg);         //set customer setting
            return ck && ck(status);

        } catch (error) {
            status.first=false;
            status.message="Invalid config setting file";
            return ck && ck(status);
        } 
    },    

    /* fresh the setting
    * @param {boolean}    [force]    //force to fresh setting
    * @param {string}     [pass]     //password to fresh setting
    */
    save:()=>{
        const key=funs.getSettingKey(metadata.address,metadata.pass);
        //console.log(key);
        const dt=JSON.stringify(cache);
        if(key.length===(64+config.system.prefix.length+1)){    //check wether encried;
            const edata=funs.encodeData(dt,metadata.address,metadata.pass);
            //console.log(edata);
            localStorage.setItem(key,edata);
        }else{
            localStorage.setItem(key,dt);
        }
    },

    /*  get target value of config
    *   @param  {string | array}    path    //the path to get the value of config
    *   @param  {object}    [obj]           //for loop target, no need to input
    */
    get:(path,obj)=>{
        //1.check wether init the setting
        if(cache===null) return self.init(()=>{
            return self.get(path);
        });
        if(obj===undefined) obj=cache;
        if(!path) return tools.clone(obj);
        
        //2.saving result if the end of path
        if(Array.isArray(path)){
            if(path.length===1){
                //console.log(`here: ${!obj[path[0]]?false:tools.clone(obj[path[0]])}`)
                return !obj[path[0]]?false:tools.clone(obj[path[0]]);
            }else{
                const kk=path.shift();
                obj=obj[kk];
                return self.get(path,obj);
            }
        }else{
            return !obj[path]?false:tools.clone(obj[path]);
        }
    },

    /*  set target value of config
    *   @param  {string | array}    path    //the path to get the value of config
    *   @param  {any}               val     //value to set
    *   @param  {boolean}   [force]         //wether force to save to localstorage
    *   @param  {object}    [obj]           //for loop target, no need to input
    */  

    set:(path,val,force,obj)=>{
        //1.check wether init the setting
        if(cache===null) return self.init(()=>{
            return self.set(path,val,force);
        });

        //2.saving result if the end of path
        if(obj===undefined) obj=cache;
        if(path.length===1){
            if(!obj[path[0]]) return false;
            obj[path[0]]=val;
            if(force) self.save();
            return true;
        }

        //3.reset the point to the setting path
        const kk=path.shift();
        if(!obj[kk]) return false;
        obj=obj[kk];
        return self.set(path,val,force,obj);
    },
}

export default self;