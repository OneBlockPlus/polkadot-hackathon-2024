import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

import Template from "./template";

import Data from "../lib/data";
import tools from "../lib/tools";
import Copy from "../lib/clipboard";

import RenderiNFT from "./inft";
import TPL from "../lib/tpl";

import SmallHash from "./hash_small";
import PartSection from "./part_section";

import { FaBackspace, FaCopy, FaSyncAlt,FaCalculator } from "react-icons/fa";

let current = 0;
let hash = "0x0e70dc74951952060b5600949828445eb0acbc6d9b8dbcc396c853f889fea9bb";
function Detail(props) {
    const size = {
        row: [12],
        back: [10, 2],
        formula:[10,2],
        title: [2, 7, 3],
        thumb: [7, 5],
        hash: [10, 2],
        part: [2],
    };

    const dialog = props.dialog;
    const alink = props.alink;

    let [start, setStart] = useState(0);
    let [step, setStep] = useState(0);
    let [value, setValue] = useState("00");
    let [dvd, setDvd] = useState(8);
    let [dec, setDec] = useState(false);
    let [offsetTemplate,setOffsetTemplate]=useState(0);
    let [showFormula,setShowFormula]=useState(false);

    let [parts, setParts] = useState([]);        //iNFT parts list

    let [selected, setSelected] = useState(0);        //selected iNFT parts
    let [active, setActive] = useState(null);         //index of selected image range

    let [recover, setRecover] = useState({});


    const self = {
        clickBack: () => {
            dialog(<Template fresh={props.fresh} dialog={props.dialog} />, "Template");
        },
        clickGrid: (index) => {
            //console.log(`Index ${index} clicked.`);
            setActive(index);
        },
        clickPart: (index) => {
            setSelected(index);
            current = index;
            self.autoFresh(index, active);
        },
        clickHashFresh: (ev) => {
            hash = self.randomHash(64);
            self.autoFresh(current, active);
        },
        clickCopy: (cid) => {
            Copy(cid);
        },
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
        clickValue:()=>{
            setDec(!dec);
        },
        clickFormula:()=>{
            setShowFormula(!showFormula);
        },
        randomHash: (n) => {
            const str = "01234567890abcdef";
            let hex = "0x";
            for (let i = 0; i < n; i++) hex += str[tools.rand(0, str.length - 1)];
            return hex;
        },
        getBackground: (index) => {
            const selected_grid = Data.get("grid");
            const ac = "#4aab67";
            const sc = "#f7cece";
            const bc = "#99ce23";
            if (selected_grid === index) {
                return sc;
            } else {
                return active === index ? ac : bc
            }
        },
        //ipart: 选中的组件
        //iselect, 选中的零件
        autoFresh: (ipart, iselect, nhash) => {
            TPL.view(alink.toLocaleLowerCase(), (def) => {
                if(def===null || !def) return false;
                
                //0.get template parameters
                const target = def.parts[ipart];
                //const w = def.cell[0], h = def.cell[1];
                //const [gX, gY, eX, eY] = target.img;
                const [start, step, divide, offset] = target.value;
                //const [line, row] = def.grid;

                setOffsetTemplate(offset);
                
                //1. set hash board
                setStart(start);
                setStep(step);
                setDvd(divide);
                setValue(nhash === undefined ? hash.slice(start + 2, start + 2 + step) : nhash.slice(start + 2, start + 2 + step));

                //3.显示组件列表
                setParts(def.parts);

            });
        },
    }

    useEffect(() => {
        //console.log(props);
        self.autoFresh(selected, active);

    }, [props.update]);

    return (
        <Row className="pt-1">
            <Col className="pt-1" sm={size.back[0]} xs={size.back[0]}>
                IPFS CID: <strong>{tools.shorten(props.alink,8)}</strong><button className="btn btn-sm btn-secondary" style={{ marginLeft: "10px" }} onClick={(ev) => {
                    self.clickCopy(props.alink);
                    self.clickRecover("copy");
                }}><FaCopy className={!recover.copy ? "" : recover.copy} /></button>
            </Col>
            <Col className="text-end" sm={size.back[1]} xs={size.back[1]}>
                <FaBackspace className="pointer" size={40} color={"#FFAABB"} onClick={(ev) => {
                    self.clickBack(ev);
                }} />
            </Col>
            <Col className="pt-2" sm={size.formula[0]} xs={size.formula[0]}>
                <h5>
                    ( <button className={dec?"btn btn-md btn-secondary":"btn btn-md btn-secondary text-warning"} onClick={()=>{
                        self.clickValue();
                    }}><strong>{dec?parseInt(`0x${value}`):`0x${value}`}</strong></button>+ 
                    <button className="btn btn-md btn-secondary" disabled>{offsetTemplate}</button>+ 
                    <button className="btn btn-md btn-secondary" disabled>0</button> ) % <button className="btn btn-md btn-secondary" disabled>{dvd}</button> =  
                    <button className="btn btn-md text-warning pl-2" disabled>{(parseInt(`0x${value}`)+offsetTemplate) % dvd}</button> 
                </h5>
            </Col>
            <Col className="pt-2 text-end" sm={size.formula[1]} xs={size.formula[1]}>
                <FaCalculator className={showFormula?"pointer pt-2  text-info":"pointer pt-2"} size={30} onClick={(ev) => {
                    self.clickFormula();
                }} />
            </Col>
            <Col hidden={!showFormula} className="pt-2" sm={size.row[0]} xs={size.row[0]}>
                <small>SELECTED_PART = ( <br/>HASH_VALUE + <br/>OFFSET_TEMPLATE + <br/>OFFSET_MINT ) % <br/>PART_DIVIDE </small>
            </Col>
            <Col className="pt-2" sm={size.row[0]} xs={size.row[0]}>
                <Row>
                    <Col sm={size.thumb[0]} xs={size.thumb[0]}>
                        <RenderiNFT 
                            hash={hash} 
                            offset={[]} 
                            id={"pre_template"} 
                            template={props.alink} 
                            hightlight={selected}
                            force={true}
                        />
                    </Col>
                    <Col sm={size.thumb[1]} xs={size.thumb[1]}>
                        <Row>
                            <Col className="text-center" sm={size.row[0]} xs={size.row[0]}>
                                Mock hash ( {hash.length - 2} )
                            </Col>
                        </Row>
                        <SmallHash hash={hash} start={start} step={step} />
                        <Row>
                            <Col className="text-center pt-1" sm={size.row[0]} xs={size.row[0]}>
                                <button className="btn btn-md btn-secondary" onClick={(ev) => {
                                    self.clickHashFresh(ev);
                                }}>
                                    <FaSyncAlt className="pointer" size={16} color={"#FFAABB"} />
                                </button>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Col>
            <Col className="" sm={size.row[0]} xs={size.row[0]}>
                <small>Range of part at orgin image.</small>
                <PartSection only={false} index={selected} selected={(parseInt(`0x${value}`)+offsetTemplate) % dvd} template={props.alink}/>
            </Col>
            <Col className="pt-2" sm={size.row[0]} xs={size.row[0]}>
                iNFT template {parts.length} parts selector.
            </Col>
            <Col className="" sm={size.row[0]} xs={size.row[0]}>
                <Row>
                    {parts.map((row, index) => (
                        <Col key={index} className="pt-2" sm={size.part[0]} xs={size.part[0]}>
                            <button className={index === selected ? "btn btn-md btn-secondary text-warning" : "btn btn-md btn-secondary"} onClick={(ev) => {
                                self.clickPart(index);
                            }}>
                                {/* <FaPuzzlePiece size="20" color={"#AAAAAA"} style={{marginTop:"-5px"}}/> */}
                                <strong>#{index + 1}</strong>
                            </button>
                        </Col>
                    ))}
                </Row>
            </Col>
        </Row>
    )
}

export default Detail;