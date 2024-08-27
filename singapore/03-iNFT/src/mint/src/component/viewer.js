import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

import { FaBackspace } from "react-icons/fa";

import Local from "../lib/local";
import Render from "../lib/render";
import Data from "../lib/data";
import tools from "../lib/tools";

import Network from "../network/router";

function Viewer(props) {
    const size = {
        row: [12],
        sell:[7,5],
        back:[10,2],
        info:[10,2],
    };

    let [market, setMarket]=useState("");

    let [width,setWidth]    =useState(100);
    let [height, setHeight] =useState(100);
    let [block,setBlock]= useState(0);
    
    let [block_hash,setBlockHash]=useState("");

    const dom_id="pre_viewer";

    const self={
        show:()=>{
            // setBlock(props.block);
            // setBlockHash(props.hash);

            // const tpl = Data.getHash("cache", props.template);
            // setWidth(tpl.size[0]);
            // setHeight(tpl.size[1]);
            // setTimeout(() => {
            //     const pen = Render.create(dom_id,true);
            //     const basic = {
            //         cell: tpl.cell,
            //         grid: tpl.grid,
            //         target: tpl.size
            //     }
            //     Render.clear(dom_id);
            //     Render.preview(pen,tpl.image,props.hash,tpl.parts,basic,props.offset);
            // }, 50);
        },
    }

    useEffect(() => {
        //1.show render result;
        self.show();

        //3.get selling status; Confirm from network. Fix the data automatically.
        // Network("tanssi").view(props.anchor,"anchor",(dt)=>{

        // });

    }, [props.update]);

    return (
        <Row>
            <Col className="pt-2" sm={size.back[0]} xs={size.back[0]}>
                {props.anchor}
            </Col>
            <Col className="pb-2 text-end" hidden={!props.back} sm={size.back[1]} xs={size.back[1]}>
                <FaBackspace className="pointer" size={40} color={"#FFAABB"} onClick={(ev)=>{
                    self.clickHome(ev);
                }}/>
            </Col>
            <Col className="text-center pt-2" sm={size.row[0]} xs={size.row[0]} style={{minHeight:"300px"}}>
                <canvas width={width} height={height} id={dom_id}></canvas>
            </Col>
            <Col className="pt-2" sm={size.row[0]} xs={size.row[0]}>
                Block hash: {tools.shorten(block_hash,12)}
            </Col>
        </Row>
    )
}

export default Viewer;