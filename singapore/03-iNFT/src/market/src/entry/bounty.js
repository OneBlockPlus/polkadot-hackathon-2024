import { Row, Col } from "react-bootstrap";
import { useState,useEffect } from "react";

import BountyList from "../component/bounty_list";
import BountySubmit from "../component/bounty_submit";
import BountyPreview from "../component/bounty_preview";

import tools from "../lib/tools";
import Network from "../network/router";

function Bounty(props) {
    const size = {
        row: [12],
        head: [10, 2]
    };

    //let [data,setData]= useState({});
    let [ content, setContent] =useState("");
    let [ network, setNetwork ]= useState("anchor");
    let [ block, setBlock]=useState(0);
    let [ hidden, setHidden ] =useState(false);

    const map={
        "basic":<BountyList link={props.link} dialog={props.dialog} extend={props.extend}/>,
        "view": <BountyPreview link={props.link} dialog={props.dialog} data={props.extend} />,
        "404":"404 page",
    }

    const self = {
        clickAdd:(ev)=>{
            props.dialog.show(<BountySubmit dialog={props.dialog} />,"Bounty Submission");
        },
    }

    useEffect(() => {
        if(!props.extend){
            setHidden(false);
            setContent(map.basic);
        }else if(props.extend.anchor && props.extend.block){
            setHidden(true);
            setContent(map.view);
        }else{
            setHidden(false);
            setContent(map.basic);
        }

        const chain=Network("anchor");
        chain.subscribe("bounty",(bk,hash)=>{
            setBlock(bk);
            
        });

        // chain.view(3582,"blocknumber",(dt)=>{
        //     console.log(dt);
        // });

        // chain.accuracy((dt)=>{
        //     console.log(dt);
        // });

        //14M4Qj1Bh3TEuaKchriMaLYd8oYUmgPfuSsXUYEGn21WGJB8
        // chain.balance("14M4Qj1Bh3TEuaKchriMaLYd8oYUmgPfuSsXUYEGn21WGJB8",(dt)=>{
        //     console.log(dt);
        // });
        
        // chain.generate("111111",(dt)=>{
        //     console.log(dt);
        // }); 

    }, [props.extend]);

    return (
        <Row className="pt-2">
            <Col hidden={hidden} md={size.head[0]} lg={size.head[0]} xl={size.head[0]} xxl={size.head[0]} >
                {tools.toUp(network)} network current block number {block.toLocaleString()}
            </Col>
            <Col hidden={hidden} className="text-end" md={size.head[1]} lg={size.head[1]} xl={size.head[1]} xxl={size.head[1]} >
                <button className="btn btn-md btn-primary" onClick={(ev)=>{
                    self.clickAdd(ev);
                }}> + Bounty </button>
            </Col>
            <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                {content}
            </Col>
        </Row>
    )
}

export default Bounty;