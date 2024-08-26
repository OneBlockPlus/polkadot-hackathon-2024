import { Row, Col, Breadcrumb } from "react-bootstrap";
import { useEffect, useState } from "react";

import DetailINFT from "../component/inft_detail";
import MoreINFT from "../component/inft_more";
import AccountSign from "../component/account_sign";
//import BountyMinting from "../component/bounty_minting";
import CommentList from "../component/commnet_list";
import CommentSubmit from "../component/commnet_submit";

import INFT from "../system/inft";
import Network from "../network/router";

function View(props) {
    const size = {
        row: [12],
        header:[5,7],
        buy:[8,2,2],
        half:[6,6],
    };

    let [data, setData] = useState();
    let [template, setTemplate] = useState("");
    let [update, setUpdate] = useState(0);
    let [alink,setAlink] = useState("");
    
    const payment={
        wallet:{},
        local:{},
    }

    const self = {
        checkName:(str)=>{
            const arr=str.split("@");
            if(arr.length===1) return {name:str};
            const network=arr.pop();
            return {name:arr.join("@"),network:network}
        },
        clickBuy:(pair)=>{
            //console.log(`Buying...`,pair,data);
            const chain=Network("anchor");
            chain.buy(pair.signer,data.name,(process)=>{
                console.log(process);
            },pair.wallet,pair.address);
        },
        getAlink:()=>{
            console.log(props);
            return "abc";
        },
    }

    useEffect(() => {
        
        if(props.extend  && props.extend.name){
            const dt=self.checkName(props.extend.name);
            INFT.single(dt.name,(res)=>{
                setAlink(`anchor://${res.name}/${res.block}`);
                setTemplate(res.raw.tpl);
                setData(res);
            });
        }
    }, [props.update,props.extend]);

    return (
        <Row className="pt-2">
            <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                <Breadcrumb>
                    <Breadcrumb.Item onClick={(ev)=>{props.link("home")}}>Home</Breadcrumb.Item>
                    <Breadcrumb.Item onClick={(ev)=>{props.link("market")}}>Market</Breadcrumb.Item>
                    <Breadcrumb.Item active>iNFT</Breadcrumb.Item>
                </Breadcrumb>
            </Col>
            <Col md={size.header[0]} lg={size.header[0]} xl={size.header[0]} xxl={size.header[0]} >
                
                <Row>
                    <Col md={size.half[0]} lg={size.half[0]} xl={size.half[0]} xxl={size.half[0]} >
                        <img className="view_thumb" src={(!data||!data.bs64)?`${window.location.origin}/imgs/logo.png`:data.bs64}  alt="thumb"/>
                        {!data || !data.local?"Network":"Local Cache"}
                    </Col>
                    <Col md={size.half[0]} lg={size.half[0]} xl={size.half[0]} xxl={size.half[0]} >
                        <DetailINFT data={data} link={props.link} />   
                    </Col>
                    <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                        <MoreINFT data={data} link={props.link} />   
                    </Col>
                    
                    <Col style={{marginTop:"150px"}} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                        <AccountSign title={"Buy now"} network={"anchor"} callback={(pair)=>{
                            self.clickBuy(pair);
                        }}/>
                    </Col>
                </Row>
            </Col>
            <Col md={size.header[1]} lg={size.header[1]} xl={size.header[1]} xxl={size.header[1]} >
                {/* <BountyMinting template={template} bounty={props.name}/> */}
                <CommentList alink={alink} update={update} height={612} />
                <CommentSubmit alink={alink} callback={() => {
                    setUpdate(update + 1);
                }} />
            </Col>
            <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                
            </Col>
        </Row>
    )
}

export default View;