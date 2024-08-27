import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

import Data from "../lib/data";
import config from "../config";

let wsAPI = null;
let linking = false;
const server=config.node;

function Operation(props) {
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
        clickWrite: (ev) => {
            self.link(server, (WS) => {
                const keyring = new window.Polkadot.Keyring({ type: "sr25519" });
                const pair = keyring.createFromJson(encryFile);

                try {
                    pair.decodePkcs8(password);
                    //console.log(WS);
                    const ankr = window.AnchorJS;
                    ankr.set(WS);
                    const raw = self.getNFTData(2);
                    const protocol = self.getNFTProtocol();

                    ankr.write(pair, anchor, JSON.stringify(raw), JSON.stringify(protocol), (res) => {
                        //console.log(res);
                        setFinal(res.message);
                        if(res.step==="Finalized"){
                            //start: 20478
                            //end: 
                            ankr.search(anchor,(data)=>{
                                console.log(data);
                                setFinal(`Template link: anchor://${anchor}/${data.block}`);
                            });
                        }
                    });
                } catch (error) {

                }
            })
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

        
    }, [props.update]);

    return (
        <Row className="pt-2">
            <Col lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                {/* <h5>Write iNFT template to Anchor Network</h5> */}
                <h5>Write iNFT template to blockchain</h5>
            </Col>
            <Col lg={size.encry[0]} xl={size.encry[0]} xxl={size.encry[0]} >
                <small>{info}</small>
                <input disabled={disable} className="form-control" type="file" onChange={(ev) => {
                    self.changeJSON(ev);
                }} />
            </Col>
            <Col lg={size.encry[1]} xl={size.encry[1]} xxl={size.encry[1]} >
                <small>Password</small>
                <input disabled={disable} className="form-control" type="password" placeholder="Password..." onChange={(ev) => {
                    self.changePassword(ev);
                }} />
            </Col>
            <Col className="pt-4" lg={size.write[0]} xl={size.write[0]} xxl={size.write[0]} >
                <input disabled={disable} className="form-control" type="text" placeholder="Anchor Name..." onChange={(ev) => {
                    self.changeAnchor(ev);
                }} />
            </Col>
            <Col className="pt-4 text-end" lg={size.write[1]} xl={size.write[1]} xxl={size.write[1]} >
                <button disabled={writeable} className="btn btn-md btn-primary" onClick={(ev) => {
                    self.clickWrite(ev);
                }}>To Chain</button>
            </Col>
            <Col className="pt-2 text-end" lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                {final}
            </Col>
        </Row>
    )
}

export default Operation;