import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

import { FaCheck } from "react-icons/fa";

import SettingNetwork from "./setting_network";

import tools from "../lib/tools"
import TPL from "../lib/tpl";
import INFT from "../lib/inft";

function Setting(props) {
    const size = {
        row: [12],
        offset: [8, 4],
        multi: [4, 4, 4],
        agent: [9, 4],
    };

    const config = {
        multiMax: 9,
    }

    //get current setting
    const detail = INFT.mint.detail();
    const cid = TPL.current(true);
    const cway=(!detail.template|| !detail.template[cid] || !detail.template[cid].way)?1:detail.template[cid].way

    let [multi, setMulti] = useState(1);            //multi task amount
    let [proxy, setProxy] = useState(detail.proxy);         //wether use agent to access
    let [way, setWay]=useState(cway);

    const self = {
        clickIncMulti: (ev) => {
            if (multi !== config.multiMax) {
                const n = multi + 1;
                setMulti(n);
                self.updateMulti(n);
            }
        },

        clickDecMulti: (ev) => {
            if (multi !== 1) {
                const n = multi - 1;
                setMulti(n);
                self.updateMulti(n);
            }
        },
        clickProxy:(ev)=>{
            const enable=!proxy;
            self.updateProxy(enable)
            setProxy(enable);
        },
        clickRandomWay:(ev)=>{
            const way=1;
            setWay(way);
            self.updateOffset(way);
        },
        clickNoOffsetWay:(ev)=>{
            const way=2;
            setWay(way);
            self.updateOffset(way);
        },
        clickCustomizeWay:(ev)=>{
            const way=3;
            setWay(way);
            self.updateOffset(way);
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
        updateProxy: (enable) => {
            const px={proxy:enable};
            INFT.mint.update(px);

            console.log(enable);

            TPL.setAgent(enable);
            TPL.reset(()=>{
                console.log(`Freshed`);
                props.fresh();
            });
        },
        updateMulti: (n) => {
            const active = TPL.current();
            const detail = INFT.mint.detail();
            const cid = active.cid;
            if (!detail.template[cid]) {
                detail.template[cid] = {
                    multi: n,
                    offset: self.getMintOffset(active.parts),
                }
            } else {
                detail.template[cid].multi = n;
            }
            INFT.mint.update(detail);
        },
        updateOffset:(way)=>{
            const active=TPL.current();
            const detail=INFT.mint.detail();
            const cid=active.cid;
            if(!detail.template[cid]){
                detail.template[cid]={
                    way:way,
                    multi:1,
                    offset:self.getMintOffset(active.parts),
                }
            }else{
                if(!detail.template[cid].way) detail.template[cid].way=1;
                detail.template[cid].way=way;
            }
            INFT.mint.update(detail);
        },
        autoShow: () => {
            const active = TPL.current();
            if (active === null) return setTimeout(() => {
                self.autoShow();
            }, 1000);

            const os = INFT.mint.detail("template");
            if (!os[active.cid]) {
                os[active.cid] = {
                    way:1,
                    multi: 1,
                    offset: self.getMintOffset(active.parts),
                }
                INFT.mint.update({ template: os });
            }
            const multi = os[active.cid].multi;

            //setAmount(active.parts.length);
            //setCid(active.cid);
            setMulti(multi !== undefined ? multi : 1);
        },

        getProxyClass:(isProxy)=>{
            return `btn btn-sm btn-secondary full ${isProxy?"text-warning":""}`;
        },
    }

    useEffect(() => {
        self.autoShow();

    }, [props.update]);

    const bmap = { width: "100%" }

    return (
        <Row>
            <Col sm={size.row[0]} xs={size.row[0]}>
                <h4>Network</h4>
            </Col>
            <Col className="pb-4" sm={size.row[0]} xs={size.row[0]}>
                <SettingNetwork fresh={props.fresh}/>
            </Col>
            <Col sm={size.row[0]} xs={size.row[0]}>
                <h4>Offset</h4>
            </Col>
            <Col sm={size.row[0]} xs={size.row[0]}>
                <Row>
                    <Col className={`pt-2 ${way===1?"text-warning":""}`} sm={size.offset[0]} xs={size.offset[0]}>
                        Default, random offset, different result on the same block.
                    </Col>
                    <Col className="pt-2" sm={size.offset[1]} xs={size.offset[1]}>
                        <button className={`btn btn-sm btn-secondary mt-2 full ${way===1?"text-warning":""}`} onClick={(ev)=>{
                            self.clickRandomWay(ev)
                        }}>
                            <FaCheck hidden={way!==1} className="pr-1" />Random
                        </button>
                    </Col>

                    <Col className={`pt-2 ${way===2?"text-warning":""}`} sm={size.offset[0]} xs={size.offset[0]}>
                        All zero offset, same result on the same block.
                    </Col>
                    <Col className="pt-2" sm={size.offset[1]} xs={size.offset[1]}>
                        <button className={`btn btn-sm btn-secondary mt-2 full ${way===2?"text-warning":""}`} onClick={(ev)=>{
                            self.clickNoOffsetWay(ev)
                        }}>
                            <FaCheck hidden={way!==2} className="pr-1" />Empty
                        </button>
                    </Col>

                    <Col className={`pt-2 ${way===3?"text-warning":""}`} sm={size.offset[0]} xs={size.offset[0]}>

                    </Col>
                    <Col className="pt-2" sm={size.offset[1]} xs={size.offset[1]}>
                        <button disabled={true} className={`btn btn-sm btn-secondary mt-2 full ${way===3?"text-warning":""}`} onClick={(ev)=>{
                            self.clickCustomizeWay(ev)
                        }}>
                            <FaCheck hidden={way!==3}  className="pr-1"/>Customize
                        </button>
                    </Col>
                </Row>
            </Col>

            <Col sm={size.row[0]} xs={size.row[0]}>
                <hr />
            </Col>
            <Col sm={size.row[0]} xs={size.row[0]}>
                <h4>Enable proxy</h4>
            </Col>
            <Col sm={size.row[0]} xs={size.row[0]}>
                <Row>
                    <Col className={!proxy?"":"text-warning"} sm={size.offset[0]} xs={size.offset[0]}>
                        Get data through agent server.
                    </Col>
                    <Col className="" sm={size.offset[1]} xs={size.offset[1]}>
                        <button className={self.getProxyClass(proxy)} onClick={(ev)=>{
                            self.clickProxy(ev);
                        }}>
                            <FaCheck hidden={!proxy} className="pr-2" />{proxy?"Enabled":"Disabled"}
                        </button>
                    </Col>
                </Row>
            </Col>

            <Col sm={size.row[0]} xs={size.row[0]}>
                <hr />
            </Col>
            <Col sm={size.row[0]} xs={size.row[0]}>
                <h4>Amount to mint</h4>
            </Col>
            <Col className="text-center" sm={size.row[0]} xs={size.row[0]}>
                Set the mint times/click, {config.multiMax} max.
            </Col>
            <Col className="pt-2 text-end" sm={size.multi[0]} xs={size.multi[0]}>
                <button disabled={multi === 1} className="btn btn-md btn-secondary" onClick={(ev) => {
                    self.clickDecMulti(ev);
                }}>-</button>
            </Col>
            <Col className="pt-2 text-center unselect" sm={size.multi[1]} xs={size.multi[1]}>
                <h2 className="text-warning">{multi}</h2>
            </Col>
            <Col className="pt-2" sm={size.multi[2]} xs={size.multi[2]}>
                <button disabled={multi === config.multiMax} className="btn btn-md btn-secondary" onClick={(ev) => {
                    self.clickIncMulti(ev);
                }}>+</button>
            </Col>
        </Row>
    )
}

export default Setting;