import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

import Setting from "./setting";
import Progress from "./progress";

import Local from "../lib/local";
import Account from "./account";
import tools from "../lib/tools";
import Data from "../lib/data";

import TPL from "../lib/tpl";
import INFT from "../lib/inft";
import Network from "../network/router";

import { FaCogs, FaIndent } from "react-icons/fa";

function Action(props) {
    const size = {
        row: [12],
        password: [1, 10, 1],
        more: [2, 2, 8]
    };

    const config={
        circle:2,           //how many block to start minting
        round:40,           //full time to mint one
    }

    let [info, setInfo] = useState(" ");
    let [password, setPassword] = useState("");
    let [hidden, setHidden] = useState(true);
    let [disable, setDisable] = useState(false);
    let [holder, setHolder] = useState("Password");

    const self = {
        getProtocol: () => {
            return {
                type: "data",       //inft is type of data
                fmt: "json",        //json data
                tpl: "inft",        //inft format
            }
        },

        getRaw: (cid,offset) => {
            return {
                tpl: cid,          //ipfs cid
                offset: !offset?[]:offset,
                from: "ipfs",            //storage way
                origin: "web3.storage",   //storage origianl
            }
        },
        done:(current_block)=>{
            //1.last mint is done;
            const task=INFT.mint.detail("task");
            if(task.length===0) return true;

            const last=task[task.length-1];

            if(last.now===8) return true;

            //2.error when minting;
            return true;
            //return false;
        },
        changePassword: (ev) => {
            setPassword(ev.target.value);
            setDisable(!ev.target.value ? true : false);
        },
        clickSetting: () => {
            props.dialog(<Setting fresh={props.fresh} />, "Mint Configure");
        },
        clickPanel: () => {
            props.dialog(<Progress block={props.block} dialog={props.dialog} />, "Mint Board");
        },
        clickTask: () => {
            const fa = Local.get("login");
            if (fa === undefined) return props.dialog(<Account fresh={props.fresh} dialog={props.dialog} />, "Account Management");
            if (!password) {
                setDisable(true);
                return false;
            }
            setDisable(true);

            //1.check wether the last task is done;
            if(!self.done()){
                setInfo(`There is running task.`);
                setPassword("");
                return false;
            }
             
            //2.check the password for account
            const cur=Data.getHash("cache","network");
            Network(cur).load(fa, password, (pair) => {
                setPassword("");
                if (pair.error !== undefined) {
                    setInfo(pair.error);
                    return false;
                }

                props.dialog(<Progress block={props.block} dialog={props.dialog}/>, "Mint Board");

                const tpl=TPL.current();
                const mint_detail=INFT.mint.detail();
                const multi=self.getMulti(mint_detail.template,tpl.cid);

                mint_detail.task=self.getTask(mint_detail.pre, parseInt(mint_detail.index), tpl.cid, multi);
                mint_detail.index=parseInt(mint_detail.index)+multi;
                INFT.mint.update(mint_detail);
                self.runTask(pair, tpl);               
            });
        },
        getMulti:(tpls,cid)=>{
            if(!tpls || !tpls[cid] || !tpls[cid].multi) return 1;
            return tpls[cid].multi;
        },
        getTask: (prefix, pointer, template, n) => {
            console.log(template);
            const arr = [];
            for (let i = 0; i < n; i++) {
                arr.push({
                    name: `${prefix}_${pointer + i}`,
                    tpl: template,
                    hash: "0x",
                    block: 0,
                    now: 0,
                });
            }
            return arr;
        },
        getMintOffset:(parts)=>{
            const os=[];
            for(let i=0;i<parts.length;i++){
                const part=parts[i];
                const divide=part.value[2];
                os.push(tools.rand(0,divide-1));
            }
            return os;
        },
        getOffset:(cid,parts)=>{
            const detail=INFT.mint.detail();
            if(!detail || !detail.template || !detail.template[cid] || detail.template[cid].way===1) return self.getMintOffset(parts);
            if(detail.template[cid].way===3 && detail.template[cid].offset) return detail.template[cid].offset;
            return [];
        },
        runTask: (pair, tpl) => {
            const detail=INFT.mint.detail();
            const task = detail.task;
            if (task === false) return setInfo("Failed to get task data.");

            let duration=2;
            const cur=Data.getHash("cache","network");
            Network(cur).subscribe("autorun", (bk, bhash) => {
                //console.log(`Try to run task automatically.`);

                //1.get current task;
                let index = -1;
                for (let i = 0; i < task.length; i++) {
                    const row = task[i];
                    if (row.now === 0) {
                        index = i;
                        break;
                    }
                }
                if (index === -1) return true;

                //1.1. check duration to make transactions start in the next 2 block
                //console.log(`Duration: ${duration}`);
                if(duration<config.circle){
                    duration++;
                    return true;
                }
                duration=0;

                //2.run mint from index data;
                const cid=tpl.cid;
                const offset=self.getOffset(cid,tpl.parts);
                const target = task[index];

                const raw = self.getRaw(cid,offset);
                const protocol = self.getProtocol();

                //3.update data and test writing.
                target.now = 1;
                self.updateProgress(index,target);

                //when more than one task, need closure to keep the index right.
                ((task_index,target,raw,protocol,cid) => {
                    const cur=Data.getHash("cache","network");
                    //console.log(JSON.stringify({ anchor: target.name, raw: raw, protocol: protocol }));
                    Network(cur).write(pair, { anchor: target.name, raw: raw, protocol: protocol }, (process) => {
                        if (process.error) {
                            setDisable(false);
                            return setInfo(process.error);
                        }

                        if (process.status === "Finalized") {
                            self.saveResult(cid,target.name, process.hash,raw.offset,pair.address,(block)=>{
                                target.now=process.code;
                                target.hash=process.hash;
                                target.block=block;
                                self.updateProgress(task_index,target);
                            });
                        }else{
                            if(process.code) target.now=process.code;
                            self.updateProgress(task_index,target);
                        }
                    });
                })(index,target,raw,protocol,cid);
            });
        },
        updateProgress:(index,data)=>{
            const dt=INFT.mint.detail("task");
            if(dt===false) return false;
            if(!dt[index]) return false;
            dt[index]=data;
            INFT.mint.update({task:dt});
            return true;
        },
        saveResult: (cid,name, hash,offset, creator, ck) => {
            const cur=Data.getHash("cache","network");
            Network(cur).view(hash, "block", (data) => {
                //const tpl = TPL.current(true);
                const cur=Data.getHash("cache","network");
                INFT.single.add(name, cid, hash, data.block, creator,offset,cur);
                return ck && ck(data.block);
            });
        },
    }
    useEffect(() => {
        const fa = Local.get("login");
        setHidden(fa !== undefined ? false : true);
        setDisable(fa !== undefined ? true : false);
        if (fa !== undefined) {
            try {
                const addr = JSON.parse(fa);
                setHolder(`Password of ${tools.shorten(addr.address, 4)}`);
            } catch (error) {

            }
        }
    }, [props.update]);

    return (
        <Row className="operation">
            <Col className="text-center" hidden={hidden} sm={size.row[0]} xs={size.row[0]}>
                <small>{info}</small>
            </Col>
            <Col className="text-end" hidden={hidden} sm={size.password[0]} xs={size.password[0]}>
            </Col>
            <Col className="text-center" hidden={hidden} sm={size.password[1]} xs={size.password[1]}>
                <Row>
                    <Col className="text-end" sm={size.more[0]} xs={size.more[0]}>
                        <button className="btn btn-md btn-secondary" onClick={(ev) => {
                            self.clickPanel();
                        }}><FaIndent className="" /></button>
                    </Col>
                    <Col className="text-end" sm={size.more[1]} xs={size.more[1]}>
                        <button className="btn btn-md btn-secondary" onClick={(ev) => {
                            self.clickSetting();
                        }}><FaCogs /></button>
                    </Col>
                    <Col className="" sm={size.more[2]} xs={size.more[2]}>
                        <input className="form-control" style={{ width: "100%" }} type="password" placeholder={holder}
                            value={password}
                            onChange={(ev) => {
                                self.changePassword(ev);
                            }}
                        />
                    </Col>
                </Row>
            </Col>
            <Col className="text-center pt-3" sm={size.row[0]} xs={size.row[0]}>
                <button className="btn btn-lg btn-primary" disabled={disable} onClick={(ev) => {
                    setInfo("");
                    self.clickTask(ev);
                }}>Mint Now!</button>
            </Col>
        </Row>
    )
}

export default Action;