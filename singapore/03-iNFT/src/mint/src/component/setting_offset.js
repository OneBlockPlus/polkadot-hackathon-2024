import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

import Data from "../lib/data";
import Local from "../lib/local";
import tools from "../lib/tools"
import TPL from "../lib/tpl";
import INFT from "../lib/inft";


import SmallHash from "./hash_small";
import PartSection from "./part_section";
import RenderiNFT from "./inft";

import { FaAngleDoubleUp,FaAngleDoubleDown } from "react-icons/fa";

let selected=-1;
function SettingOffset(props) {
    const size = {
        row: [12],
        offset:[1,2,7,2],
        multi:[4,4,4],
        calc:[8,1,2],
        grid:1,
        head:[6,6],
        detail:[10,2],
    };

    const config={
        multiMax:9,
    }

    let [hash, setHash]=useState("0x0e70dc74951952060b5600949828445eb0acbc6d9b8dbcc396c853f889fea9bb");

    let [hidden, setHidden]=useState(true);
    let [order, setOrder]=useState(-1);        //selected order of section

    let [amount, setAmount]=useState(0);
    let [cid, setCid]=useState("");

    let [list,setList]=useState([]);
    let [multi, setMulti]=useState(1);

    let [start, setStart]=useState(0);
    let [step, setStep]=useState(0);
    let [index, setIndex]=useState(0);

    const self={
        clickRow:(index,val)=>{
            //console.log(`Clicked.${index}`);
            selected=index;

            const active=Data.get("template");
            const single=active.parts[index];
            //const max=single.value[2];

            setIndex(index);
            setStart(single.value[0]);
            setStep(single.value[1]);

            //const latest=(val>max-2)?0:val+1;
            setOrder(self.getPartValue(index,val));
        },
        clickSingleOffset:(index,val)=>{
            //const final=self.getFinal(index,offset);
            selected=index;

            const active=Data.get("template");
            const single=active.parts[index];
            const max=single.value[2];

            //1.set how to get value and fresh hash board
            setIndex(index);
            setStart(single.value[0]);
            setStep(single.value[1]);

            //2. fresh selected part
            const latest=(val>max-2)?0:val+1;
            //console.log(self.getFinal(index,latest));
            setOrder(self.getPartValue(index,latest));

            //3.update setting 
            list[index]=latest;
            const nlist=tools.clone(list);
            //setOffset(nlist);   //force to fresh result;
            setList(nlist);

            self.updateOffset(nlist);
            //self.updateTemplate(active.cid,"offset",nlist);
        },
        clickIncMulti:(ev)=>{
            if(multi!==config.multiMax){
                const n=multi+1;
                setMulti(n);
                self.updateMulti(n);
            }
        },
        
        clickDecMulti:(ev)=>{
            if(multi!==1){
                const n=multi-1;
                setMulti(n);
                self.updateMulti(n);
            }
        },
        clickHidden:(ev)=>{
            setHidden(true);
        },
        clickShow:(ev)=>{
            setHidden(false);
        },
        updateMulti:(n)=>{
            const active=TPL.current();
            const detail=INFT.mint.detail();
            const cid=active.cid;
            if(!detail.template[cid]){
                detail.template[cid]={
                    multi:n,
                    offset:self.getMintOffset(active.parts),
                }
            }else{
                detail.template[cid].multi=n;
            }
            INFT.mint.update(detail);
        },
        updateOffset:(offset)=>{
            const active=TPL.current();
            const detail=INFT.mint.detail();
            const cid=active.cid;
            if(!detail.template[cid]){
                detail.template[cid]={
                    multi:1,
                    offset:self.getMintOffset(active.parts),
                }
            }else{
                detail.template[cid].offset=offset;
            }
            INFT.mint.update(detail);
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

        autoShow:()=>{
            const active=TPL.current();
            if(active===null) return setTimeout(()=>{
                self.autoShow();
            },1000);

            const os=INFT.mint.detail("template");
            if(!os[active.cid]){
                os[active.cid]={
                    multi:1,
                    offset:self.getMintOffset(active.parts),
                }
                INFT.mint.update({template:os});
            }
            const offset=os[active.cid].offset;
            const multi=os[active.cid].multi;

            setAmount(active.parts.length);
            setCid(active.cid);
            setList(offset);
            setMulti(multi!==undefined?multi:1);
        },

        getValue:(index)=>{
            const active=Data.get("template");
            const part=active.parts[index];
            const start=part.value[0];
            const step=part.value[1];
            return `0x${hash.slice(2).slice(start,start+step)}`
        },
        getDec:(index)=>{
            const active=Data.get("template");
            const part=active.parts[index];
            const start=part.value[0];
            const step=part.value[1];
            return  parseInt(`0x${hash.slice(2).slice(start,start+step)}`);
        },
        getDivide:(index)=>{
            const active=Data.get("template");
            const part=active.parts[index];
            return part.value[2];
        },
        getOffetOfTemplate:(index)=>{
            const active=Data.get("template");
            const part=active.parts[index];
            return part.value[3];
        },
        getFinal:(index,offset)=>{
            const val=self.getDec(index);
            const tpl_offset=self.getOffetOfTemplate(index);
            const final=val+tpl_offset+offset;
            return final
        },
        getPartValue:(index,offset)=>{
            const divide=self.getDivide(index);
            const final=self.getFinal(index,offset);
            return final%divide;
        },
    }

    useEffect(() => {
        selected=-1;
        self.autoShow();

    }, [props.update]);

    const cmap={
        background:"#555555",
        borderRadius:"10px"
    }

    return (
        <Row>
            <Col className="pb-2" sm={size.detail[0]} xs={size.detail[0]}>
                <strong>{amount}</strong> parts of template <strong>{tools.shorten(cid,8)}</strong>
            </Col>
            <Col hidden={!hidden} className="pb-2 text-end" sm={size.detail[1]} xs={size.detail[1]}>
                <button className="btn btn-sm btn-secondary" onClick={(ev)=>{
                    self.clickShow(ev);
                }}><FaAngleDoubleDown /></button>
            </Col>
            <Col hidden={hidden} className="pb-2 text-end" sm={size.detail[1]} xs={size.detail[1]}>
                <button className="btn btn-sm btn-secondary" onClick={(ev)=>{
                    self.clickHidden(ev);
                }}><FaAngleDoubleUp /></button>
            </Col>
            <Col hidden={hidden} sm={size.row[0]} xs={size.row[0]}>
                <Row>
                    <Col className="text-center board pb-2" style={cmap} sm={size.head[0]} xs={size.head[0]}>
                        <Col className="text-center pt-2" sm={size.row[0]} xs={size.row[0]}>
                            Mock hash
                        </Col>
                        <SmallHash hash={hash} start={start} step={step} grid={8}/>
                    </Col>
                    <Col className="pt-2 text-center" sm={size.head[1]} xs={size.head[1]}>
                        <RenderiNFT hash={hash} offset={list} id={"pre_setting"} hightlight={index} force={true}/>
                    </Col>
                    <Col sm={size.row[0]} xs={size.row[0]}>
                        <PartSection index={index} selected={order}/>
                    </Col>
                </Row>
            </Col>
            
            <Col className="pt-2 pb-2" style={cmap} sm={size.row[0]} xs={size.row[0]}>
                <div className="setting">
                {list.map((row, index) => (        
                    <Row key={index} className="pointer">
                        <Col className="pt-2" sm={size.offset[0]} xs={size.offset[0]} onClick={(ev)=>{
                            self.clickRow(index,row)
                        }}>
                            <h5 className={index===selected?"text-info":""}>#{index+1}</h5>
                        </Col>
                        <Col className="pt-2 text-end" sm={size.offset[1]} xs={size.offset[1]} onClick={(ev)=>{
                            self.clickRow(index,row)
                        }}>
                            <span className={index===selected?"text-info":""}>{self.getValue(index)}</span>
                        </Col>
                        <Col className="pt-2 text-center" sm={size.offset[2]} xs={size.offset[2]} onClick={(ev)=>{
                            self.clickRow(index,row)
                        }}>
                            <Row>
                                <Col className="text-end" sm={size.calc[0]} xs={size.calc[0]}>
                                    <span className={index===selected?"text-info":""}>{"( "}{self.getDec(index)}{" + "}{self.getOffetOfTemplate(index)}</span>
                                    <span className={index===selected?"text-info":""}>{" + "}</span>
                                    <span className="text-primary"><strong>{row}</strong></span>
                                    <span className={index===selected?"text-info":""}>{" )"}{" % "}{self.getDivide(index)}</span>
                                </Col>
                                <Col className="text-center" sm={size.calc[1]} xs={size.calc[1]}>
                                    <span className={index===selected?"text-info":""}>=</span>
                                </Col>
                                <Col className="" sm={size.calc[2]} xs={size.calc[2]}>
                                    <span className="text-warning"><strong>{self.getPartValue(index,row)}</strong></span>
                                </Col>
                            </Row>
                        </Col>
                        <Col className="pt-1" sm={size.offset[3]} xs={size.offset[3]}>
                            <button className="btn btn-md btn-primary offset" onClick={(ev)=>{
                                self.clickSingleOffset(index,row);
                            }}>{row}</button> 
                        </Col>
                    </Row>
                
                ))}
                </div>
            </Col>
            <Col className="pt-2" sm={size.row[0]} xs={size.row[0]}>
                ( random_value + template_offset + mint_offset ) % template_divide = selected_image_part
            </Col>
            <Col sm={size.row[0]} xs={size.row[0]}>
                <Row>
                    <Col sm={size.row[0]} xs={size.row[0]}>
                        <button className="btn btn-sm btn-secondary">No offset</button>
                        <button className="btn btn-sm btn-secondary">Random offset</button>
                        <button className="btn btn-sm btn-secondary">Customize</button>
                    </Col>
                </Row>
            </Col>
            <Col sm={size.row[0]} xs={size.row[0]}>
                <hr />
            </Col>
            <Col className="text-center" sm={size.row[0]} xs={size.row[0]}>
                Set the mint times/click, {config.multiMax} max.
            </Col>
            <Col className="pt-2 text-end" sm={size.multi[0]} xs={size.multi[0]}>
                <button disabled={multi===1} className="btn btn-md btn-secondary" onClick={(ev)=>{
                    self.clickDecMulti(ev);
                }}>-</button>
            </Col>
            <Col className="pt-2 text-center unselect" sm={size.multi[1]} xs={size.multi[1]}>
                <h2 className="text-warning">{multi}</h2>
            </Col>
            <Col className="pt-2" sm={size.multi[2]} xs={size.multi[2]}>
                <button disabled={multi===config.multiMax} className="btn btn-md btn-secondary" onClick={(ev)=>{
                    self.clickIncMulti(ev);
                }}>+</button>
            </Col>
        </Row>
    )
}

export default SettingOffset;