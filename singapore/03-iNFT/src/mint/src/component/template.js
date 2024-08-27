import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

import Detail from "./detail";

import Local from "../lib/local";
import Data from "../lib/data";
import Render from "../lib/render";
import Copy from "../lib/clipboard";
import tools from "../lib/tools";
import TPL from "../lib/tpl";

import { FaExchangeAlt, FaTrashAlt, FaCopy,FaFolderOpen } from "react-icons/fa";

function Template(props) {
    const size = {
        row: [12],
        add: [9, 3],
        detail: [9, 3],
        alink: [9, 3],
        list:[6],
        opt:[3],
    };

    let [list, setList] = useState([]);
    let [alink, setAlink] = useState("");
    let [disableAdd,setDisableAdd] = useState(true);
    let [recover,setRecover]=useState({});

    let [show, setShow]=useState(false);

    const zero = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const self = {
        changeAlink: (ev) => {
            const val=ev.target.value.trim();
            setDisableAdd(!val?true:false);
            setAlink(ev.target.value.trim());
        },
        clickAdd: (ev) => {
            if(!alink) return false;
            TPL.add(alink,(res)=>{
                setAlink("")
                self.showTemplate();
            });
        },
        clickTry:(index)=>{
            if(index===0) return true;
            TPL.change(index);
            self.showTemplate();
            props.fresh(true);
        },
        clickOpen:(index)=>{
            const tpls = JSON.parse(Local.get("template"));
            const tpl=tpls[index];
            props.dialog(<Detail alink={tpl.alink} dialog={props.dialog} fresh={props.fresh}/>,"Tempalate Details");
        },
        clickRemove:(index)=>{
            TPL.remove(index);
            self.showTemplate();
        },
        clickClean: (ev) => {
            TPL.clean();
            props.fresh();
        },
        clickRecover:(key,at)=>{
            if(!recover[key]){
                recover[key]="text-info";
                setRecover(tools.copy(recover));
                setTimeout(()=>{
                    delete recover[key];
                    setRecover(tools.copy(recover));
                },!at?1500:at);
            }
        },
        getThumbs: (arr, dom_id, ck, todo) => {
            if (todo === undefined) todo = [];
            if (arr.length === 0) return ck && ck(todo);

            //1.获取数据内容
            const me = arr.shift();
            const dt = me.data;
            const basic = {
                cell: dt.cell,
                grid: dt.grid,
                target: dt.size
            }

            //2.准备绘图用的canvas
            const con = document.getElementById("tpl_handle");
            if(con!==null){
                const cvs = document.createElement("canvas");
                cvs.id = dom_id;
                cvs.width = 400;
                cvs.height = 400;
                con.appendChild(cvs);

                const pen = Render.create(dom_id, true);
                Render.reset(pen);
                Render.preview(pen, dt.image, zero, dt.parts, basic);

                //3.获取生成的图像
                return setTimeout(() => {
                    me.bs64 = pen.canvas.toDataURL("image/jpeg");
                    //me.block = row.block;
                    //delete me.data;
                    todo.push(me);
                    con.innerHTML = "";

                    return self.getThumbs(arr, dom_id, ck, todo);
                }, 50);
            }
        },

        showTemplate: () => {
            setShow(false);
            const tpls = Local.get("template");
            const nlist = !tpls ? [] : JSON.parse(tpls);

            const arr = [];
            for (let i = 0; i < nlist.length; i++) {
                arr.push(nlist[i].alink);
            }

            TPL.auto((dels)=>{
                const last = []
                for (let i = 0; i < nlist.length; i++) {
                    nlist[i].data = Data.getHash("cache", nlist[i].alink);
                    if (!dels.includes(i)) last.push(nlist[i]);
                }
                //console.log(JSON.stringify(last));
                self.getThumbs(last, dom_id, (glist) => {
                    setShow(true);
                    setList(glist);
                });
            });
        },
        getRandomOffset:(parts)=>{
            const arr=[]
            for(let i=0;i<parts.length;i++){
                
            }
            return arr;
        },
    }

    const dom_id = "pre_image";
    useEffect(() => {
        self.showTemplate();
    }, [props.update]);

    return (
        <Row>
            <Col className="pb-2" sm={size.add[0]} xs={size.add[0]}>
                <input className="form-control" type="text" placeholder="IPFS CID of iNFT" value={alink} onChange={(ev) => {
                    self.changeAlink(ev);
                }} />
            </Col>
            <Col className="text-end pb-2" sm={size.add[1]} xs={size.add[1]}>
                <button className="btn btn-md btn-primary" disabled={disableAdd} onClick={(ev) => {
                    self.clickAdd(ev);
                }}>Add</button>
            </Col>
            <Col hidden={true} id="tpl_handle" sm={size.row[0]} xs={size.row[0]}></Col>
            <Col hidden={show} sm={size.row[0]} xs={size.row[0]}>
                 <h4>Loading templates ...</h4>
            </Col>
            <div className="limited">
                <Row hidden={!show}>
                {list.map((row, index) => (
                    <Col className="pt-2 pb-4" key={index} sm={size.list[0]} xs={size.list[0]}>
                        <Row>
                            <Col sm={size.row[0]} xs={size.row[0]}>
                                <span>
                                IPFS CID: <br />
                                <strong>{tools.shorten(row.alink,5)}</strong> <button className="btn btn-sm btn-secondary" onClick={(ev)=>{
                                    Copy(row.alink);
                                    self.clickRecover(`copy_${index}`);
                                }}><FaCopy className={!recover[`copy_${index}`]?"":recover[`copy_${index}`]}/></button><br />
                                {row.data.parts.length} parts.
                                </span>
                            </Col>
                            <Col className="text-center" sm={size.row[0]} xs={size.row[0]}>
                                <div className="thumbnail pointer" 
                                    style={{ backgroundImage:`url(${row.data.image})`}}
                                    onClick={(ev)=>{
                                        self.clickOpen(index);
                                    }}></div>
                            </Col>
                            <Col hidden={index===0} className="pt-2 text-center" sm={size.opt[0]} xs={size.opt[0]}>
                                <button className="btn btn-md btn-primary" onClick={(ev)=>{
                                    self.clickTry(index);
                                    self.clickRecover(`try_${index}`,200);
                                }}><FaExchangeAlt className={!recover[`try_${index}`]?"":recover[`try_${index}`]}/></button>
                            </Col>
                            <Col className="pt-2" sm={size.opt[0]} xs={size.opt[0]}>
                                <button className="btn btn-md btn-secondary" onClick={(ev)=>{
                                    self.clickOpen(index);
                                }}><FaFolderOpen /></button>
                            </Col>
                            <Col className="pt-2 text-center" sm={size.opt[0]} xs={size.opt[0]}>
                                {/* <FaTrashAlt className="pointer text-primary" size={28}  onClick={(ev)=>{
                                    self.clickRemove(index);
                                }}/> */}
                                <button className="btn btn-md btn-secondary" onClick={(ev)=>{
                                    self.clickRemove(index);
                                }}><FaTrashAlt /></button>
                            </Col>
                        </Row>
                    </Col>
                ))}
                </Row>
            </div>
            <Col className="pt-2" sm={size.row[0]} xs={size.row[0]}>
                <hr />
            </Col>
            <Col className="text-end" sm={size.row[0]} xs={size.row[0]}>
                <button className="btn btn-md btn-primary" onClick={(ev) => {
                    self.clickClean(ev);
                }}>Clean</button>
            </Col>
        </Row>
    )
}

export default Template;