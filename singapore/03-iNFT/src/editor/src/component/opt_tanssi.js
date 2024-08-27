import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

import IPFS from "ipfs-mini";
//import { Bee } from "@ethersphere/bee-js"

import Data from "../lib/data";
import tools from  "../lib/tools";

let wsAPI = null;
let linking = false;
const server="wss://fraa-flashbox-2690-rpc.a.stagenet.tanssi.network";  //Tanssi appchain URI
const max=360;      //anchor raw max data length 

//IPFS QmcXZGRpfpbyDCgZQwzZC9CGbAzirfBqSTx8Yqonw3RiC4
//https://crustipfs.xyz/ipfs/QmcXZGRpfpbyDCgZQwzZC9CGbAzirfBqSTx8Yqonw3RiC4?filename=iNFT.json

function Tanssi(props) {
    const size = {
        row: [12],
        encry: [6, 6],
        write: [7, 5],
    };

    let [disable, setDisable] = useState(true);
    let [writeable, setWriteable] = useState(true);
    let [encryFile, setEncryFile] = useState(null);
    let [anchor, setAnchor] = useState("");
    let [password, setPassword] = useState("");
    let [hash, setHash]=useState("");
    
    let [final, setFinal]= useState("");
    let [info, setInfo] = useState("Encry JSON file");

    const self = {
        link: (uri, ck) => {
            //console.log(uri);
            if (linking) return setTimeout(() => {
                self.link(uri, ck);
            }, 500);

            if (wsAPI !== null) return ck && ck(wsAPI);

            linking = true;
            const { ApiPromise, WsProvider } = window.Polkadot;
            try {
                const provider = new WsProvider(uri);
                ApiPromise.create({ provider: provider }).then((api) => {
                    console.log(`Linked to node.`);
                    wsAPI = api;
                    linking = false;
                    return ck && ck(wsAPI);
                });
            } catch (error) {
                console.log(error);
                linking = false;
                return ck && ck(error);
            }
        },
        getNFTData: (type) => {
            const bs64 = Data.get("template");
            const NFT = Data.get("NFT");
            const basic = Data.get("size");
            if (bs64 === null || NFT === null || basic == null) return false;

            return {
                image: bs64,         //图像的base64编码，带前缀
                size: basic.target,  //图像的基本配置
                cell: basic.cell,    //图像的裁切
                grid: basic.grid,
                parts: NFT.puzzle,        //图像的组成
                type: type,             //2D的图像， [1.像素化产品;2.2D图像;3.3D模型]
            }
        },
        getNFTProtocol: () => {
            return {
                type: "data",        //数据类型的格式
                fmt: "json",
                tpl: "iNFT",
                //app:"",
                //auth:"",          //权限设置的地方，可以免费供使用，否则采用白名单的方式来处理
            }
        },
        getRandomSizeString:(n)=>{
            let str="";
            for(let i=0;i<n;i++) str+=tools.rand(0,9);
            return str;
        },
        clickWrite: (ev) => {
            const keyring = new window.Polkadot.Keyring({ type: "sr25519" });
            const pair = keyring.createFromJson(encryFile);
            try {
                pair.decodePkcs8(password);
                const anchor="test_04";     
                const raw=self.getRandomSizeString(360); 
                //const bs64 = Data.get("template");
                //console.log(bs64);
                const pre=0;
                const protocol=JSON.stringify({type:"data",fmt:"image"});
                wsAPI.tx.anchor.setAnchor(anchor,raw, protocol, pre).signAndSend(pair, (res) => {
                    console.log(res);
                });

            } catch (error) {
                
            }
        },
        balance:(addr,ck)=>{
            let unsub=null;
            wsAPI.query.system.account(addr, (res) => {
                if(unsub!=null) unsub();
                const data=res.toJSON().data;
                return ck && ck(data);
            }).then((fun)=>{
                unsub=fun;
            });
        },
        getAmount:(val)=>{
            const ifree=val*0.000000000001;
            return ifree.toLocaleString();
        },
        changeJSON: (ev) => {
            setEncryFile(ev.target.value);
            props.fresh();
            //1.这里需要对文件内容进行处理
            try {
                const fa = ev.target.files[0];
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const sign = JSON.parse(e.target.result);
                        if (!sign.address || !sign.encoded)
                            return setInfo("Error encry JSON file");
                        if (sign.address.length !== 48)
                            return setInfo("Error SS58 address");
                        if (sign.encoded.length !== 268)
                            return setInfo("Error encoded verification");
                        setInfo("Encoded account file loaded");
                        setEncryFile(sign);

                        self.balance(sign.address,(val)=>{
                            console.log(val);
                            setHash(self.getAmount(val.free));
                        });
                        
                    } catch (error) {
                        console.log(error);
                        setInfo("Not encry JSON file");
                    }
                };
                reader.readAsText(fa);
            } catch (error) {
                setInfo("Can not load target file");
            }
        },
        changePassword: (ev) => {
            setPassword(ev.target.value);
            props.fresh();
        },
        changeAnchor: (ev) => {
            setAnchor(ev.target.value.trim());
            props.fresh();
        },
        getContentFromURL:async (url)=>{
            try {
              const response = await fetch(url);
              if (!response.ok) {
                throw new Error("Network response was not ok");
              }
              const content = await response.text();
              //console.log("Content from URL:", content);
              return content;
            } catch (error) {
              console.error("Error fetching content from URL:", error);
              throw error;
            }
        },
        autoSet:()=>{
            self.link(server, async () => {
                //console.log(wsAPI);
                // Owner of Anchor
                // wsAPI.query.anchor.anchorOwner("good", (res) => {
                //     const owner=res.value[0].toHuman();
			    //     const block = res.value[1].words[0];
                //     console.log(owner,block);
                // }).then((fun)=>{

                // });

                //subscribe
                // wsAPI.rpc.chain.subscribeFinalizedHeads((lastHeader) => {
                //     console.log(JSON.stringify(lastHeader));
                // });

                //IPFS
                // const host="ipfs.w3s.link";
                // const ipfs = new IPFS({ host: host, protocol: "https" });
                // const cid="bafkreihze725zh5uqcffao5w27qdmaihjffjzj3wvtdfjocc33ajqtzc7a";
                // console.log(host);
                // ipfs.cat(cid, (err, result) => {
                //     console.log(err, result);
                // });

                const url = "https://bafkreihze725zh5uqcffao5w27qdmaihjffjzj3wvtdfjocc33ajqtzc7a.ipfs.w3s.link/";
                self.getContentFromURL(url)
                .then((content) => {
                    //console.log(content);
                    const def=JSON.parse(content);
                    console.log(def);
                    // Do something with the content
                })
                .catch((error) => {
                    // Handle error
                });

                //Swarm bee.js
                //console.log(Bee);
                // const bee_uri="https://swarm-gateways.net/";
                // const bee = new Bee(bee_uri);
                // console.log(bee);

                // const data=JSON.stringify({hello:"iNFT"})
                // const postageBatchId = await bee.createPostageBatch("100", 17);
                
                // const result = await bee.uploadData(postageBatchId,data);
                // console.log(result.reference) 

                // const retrievedData = await bee.downloadData(result.reference)

                // console.log(retrievedData.text())
            });
        },
    }

    useEffect(() => {
        const bs64 = Data.get("template");
        const NFT = Data.get("NFT");
        const basic = Data.get("size");
        if (bs64 !== null && NFT !== null && basic !== null) {
            setDisable(false);
            if (encryFile !== null && anchor !== "" && password !== "") {
                setWriteable(false);
            } else {
                setWriteable(true);
            }
        }

        self.autoSet();

        // const aa=self.getRandomSizeString(1024*10);
        // console.log(aa.length);
        
    }, [props.update]);

    return (
        <Row className="pt-4">
            <Col lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                Write iNFT definition to Tanssi Appchain.
            </Col>
            <Col lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                {hash}
            </Col>
            <Col lg={size.encry[0]} xl={size.encry[0]} xxl={size.encry[0]} >
                <small>{info}</small>
                <input className="form-control" type="file" onChange={(ev) => {
                    self.changeJSON(ev);
                }} />
            </Col>
            <Col lg={size.encry[1]} xl={size.encry[1]} xxl={size.encry[1]} >
                <small>Password</small>
                <input  className="form-control" type="password" placeholder="Password..." onChange={(ev) => {
                    self.changePassword(ev);
                }} />
            </Col>
            <Col className="pt-2" lg={size.write[0]} xl={size.write[0]} xxl={size.write[0]} >
                <input  className="form-control" type="text" placeholder="Anchor Name..." onChange={(ev) => {
                    self.changeAnchor(ev);
                }} />
            </Col>
            <Col className="pt-2 text-end" lg={size.write[1]} xl={size.write[1]} xxl={size.write[1]} >
                <button  className="btn btn-md btn-primary" onClick={(ev) => {
                    self.clickWrite(ev);
                }}>Write</button>
            </Col>
            <Col className="pt-2 text-end" lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                {final}
            </Col>
        </Row>
    )
}

export default Tanssi;