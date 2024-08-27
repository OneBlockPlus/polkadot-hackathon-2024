import { Row, Col, Badge } from "react-bootstrap";
import { useEffect, useState } from "react";

import config from "../config";
import Copy from "../lib/clipboard";
import Local from "../lib/local";
import tools from "../lib/tools";
import Data from "../lib/data"

import Network from "../network/router";
import INFT from "../lib/inft";
import Seed from "./seed";

import { FaCopy, FaDownload, FaSignInAlt,FaFaucet } from "react-icons/fa";

function Account(props) {
    const size = {
        row: [12],
        user: [4, 8],
        logout: [8, 4],
        new: [9, 3]
    };

    let [login, setLogin] = useState(false);

    let [avatar, setAvatar] = useState("image/empty.png");
    let [balance, setBalance] = useState(0);
    let [address, setAddress] = useState("");

    let [info, setInfo] = useState("");
    let [faucet, setFaucet] = useState("");

    let [password, setPassword] = useState("");
    let [dis_new, setNewDisable] = useState(true);

    let [recover, setRecover] = useState({});

    const self = {
        getUnit:()=>{
            const cur=Data.getHash("cache","network");
            if(config.unit && config.unit[cur]) return config.unit[cur];
            return "unit";
        },
        getFaucetURL:(addr)=>{
            const cur=Data.getHash("cache","network");
            if(config.faucet && config.faucet[cur]) return `${config.faucet[cur]}/${addr}`;
            return false;
        },
        changePassword: (ev) => {
            setPassword(ev.target.value);
            setNewDisable(!ev.target.value ? true : false);
        },
        clickNewAccount: (ev) => {
            setNewDisable(true);
            const cur=Data.getHash("cache","network");
            Network(cur).generate(password,(fa,mnemonic)=>{
                Local.set("login", JSON.stringify(fa));
                setLogin(true);
                self.show();
                INFT.auto();

                props.dialog(<Seed fresh={props.fresh} dialog={props.dialog} mnemonic={mnemonic}/>,"Seed Details");
                props.fresh();
            })
        },
        clickLogout: (ev) => {
            Local.remove("login");
            setLogin(false);
            INFT.auto();
            props.fresh();
        },
        clickDownload: (ev) => {
            const fa = Local.get("login");
            if (!fa) return false;
            const json_file=`${address}.json`;
            tools.download(json_file, fa);
            self.faucetMessage(`Please keep the private key file safely.`)
        },
        clickCopy: (ev) => {
            Copy(address);
        },
        //the icon recover function
        clickRecover: (key, at) => {
            if (!recover[key]) {
                recover[key] = "text-info";
                setRecover(tools.copy(recover));
                setTimeout(() => {
                    delete recover[key];
                    setRecover(tools.copy(recover));
                }, !at ? 1000 : at);
            }
        },
        clickFaucet: async (ev) => {
            const fa = Local.get("login");
            if (fa === undefined) return self.faucetMessage("Account information missed.");
            
            try {
                const login = JSON.parse(fa);
                self.showBalance(login.address);

                const furl=self.getFaucetURL(login.address);
                if(furl===false){
                    return self.faucetMessage(`Not support yet.`);
                }else{
                    const response = await fetch(furl);
                    if (!response.ok) return self.faucetMessage("Failed to request to faucet server.");
    
                    const ctx = await response.text();
                    const rep=JSON.parse(ctx);
    
                    if(rep.error) return self.faucetMessage(rep.error);
                    return self.faucetMessage(rep.message);
                }
                
            } catch (error) {
                setFaucet("Cors issue.");
                return setTimeout(() => {
                    setFaucet("");
                }, 3000);
            }
        },
        faucetMessage:(ctx)=>{
            //console.log(ctx);
            setFaucet(ctx);
            return setTimeout(() => {
                setFaucet("");
            }, 3000);
        },
        changeFile: (ev) => {
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
                        Local.set("login", e.target.result);
                        setLogin(true);
                        self.show();
                        INFT.auto();
                        props.fresh();
                    } catch (error) {
                        setInfo("Not encry JSON file");
                    }
                };
                reader.readAsText(fa);
            } catch (error) {
                setInfo("Can not load target file");
            }
        },
        showBalance:(address)=>{
            const cur=Data.getHash("cache","network");
            Network(cur).balance(address, (res) => {
                const divide = Network(cur).divide();
                setBalance(tools.toF(res.free * (1 / divide), 8));
            })
        },
        show: () => {
            const fa = Local.get("login");
            if (fa !== undefined) setLogin(true);
            try {
                const account = JSON.parse(fa);
                setAddress(account.address);
                setAvatar(`https://robohash.org/${account.address}?set=set2`);
                
                self.showBalance(account.address);
            } catch (error) {

            }
        },
        
    }

    useEffect(() => {
        self.show();

    }, [props.update]);


    const amap = {
        width: "90px",
        height: "90px",
        borderRadius: "45px",
        background: "#FFAABB",
    };

    return (
        <Row>
            <Col className="text-center" hidden={!login} sm={size.user[0]} xs={size.user[0]}>
                <img style={amap} src={avatar} alt="user logo" />
            </Col>
            <Col hidden={!login} sm={size.user[1]} xs={size.user[1]}>
                <Row>
                    <Col className="" sm={size.row[0]} xs={size.row[0]}>
                        {tools.shorten(address, 8)}
                        <button className="btn btn-sm btn-secondary" style={{ marginLeft: "10px" }} onClick={(ev) => {
                            self.clickCopy(ev);
                            self.clickRecover("copy");
                        }}><FaCopy className={!recover.copy ? "" : recover.copy} /></button>
                    </Col>
                    <Col className="" sm={size.row[0]} xs={size.row[0]}>
                        <strong>{balance}</strong> {self.getUnit()}
                    </Col>
                </Row>
            </Col>
            <Col hidden={!login} className="pt-4" sm={size.logout[0]} xs={size.logout[0]}>
                <button className="btn btn-md btn-secondary" disabled={recover.download} onClick={(ev) => {
                    self.clickRecover("download");
                    self.clickDownload(ev);
                }}><FaDownload className={!recover.download ? "pb-1" : `pb-1 ${recover.download}`}/> Encried Key</button>
                <button className="btn btn-md btn-secondary" disabled={recover.faucet} style={{ marginLeft: "10px"}} onClick={(ev) => {
                    self.clickRecover("faucet");
                    self.clickFaucet(ev);
                }}><FaFaucet className={!recover.faucet ? "pb-1" : `pb-1 ${recover.faucet}`} /> Faucet</button>
            </Col>
            <Col hidden={!login} className="pt-4 text-end" sm={size.logout[1]} xs={size.logout[1]}>
                <button className="btn btn-md btn-danger" onClick={(ev) => {
                    self.clickLogout(ev);
                }}><FaSignInAlt className="pb-1"/> Logout</button>
            </Col>
            <Col hidden={!login} className="pt-1" sm={size.row[0]} xs={size.row[0]}>{faucet}</Col>

            <Col hidden={login} className="pt-4" sm={size.row[0]} xs={size.row[0]}>
                <h4><Badge className="bg-info">Option 1</Badge> Upload the encry JSON file.</h4>
            </Col>
            <Col hidden={login} className="pt-4" sm={size.row[0]} xs={size.row[0]}>
                <input type="file" onChange={(ev) => {
                    self.changeFile(ev);
                }} />
                <p>{info}</p>
            </Col>
            <Col className="pt-4" hidden={login} sm={size.row[0]} xs={size.row[0]}>
                <hr />
            </Col>
            <Col hidden={login} className="pt-4" sm={size.row[0]} xs={size.row[0]}>
                <h4><Badge className="bg-info">Option 2</Badge> Create a new account.</h4>
            </Col>
            <Col hidden={login} className="pt-4 pb-4" sm={size.new[0]} xs={size.new[0]}>
                <input className="form-control" type="password" placeholder="Password for new account"
                    value={password}
                    onChange={(ev) => {
                        self.changePassword(ev);
                    }}
                />
            </Col>
            <Col hidden={login} className="pt-4 pb-4 text-end" sm={size.new[1]} xs={size.new[1]}>
                <button disabled={dis_new} className="btn btn-md btn-primary" onClick={(ev) => {
                    self.clickNewAccount(ev)
                }}>Create</button>
            </Col>
        </Row>
    )
}

export default Account;