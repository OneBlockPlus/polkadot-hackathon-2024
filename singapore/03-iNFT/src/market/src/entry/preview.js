import {  Row, Col, Breadcrumb } from "react-bootstrap";
import { useEffect,useState } from "react";

import ListSeries from "../component/list_series";
import PriveiwINFT from "../component/inft_preview";
import TPL from "../system/tpl";
import tools from "../lib/tools";

function Preview(props) {
    const size = {
        row: [12],
        header: [5, 7],
        operation:[8,4],
    };

    let [template, setTemplate]=useState("");
    let [hash,setHash]=useState("0x0e70dc74951952060b5600949828445eb0acbc6d9b8dbcc396c853f8891")

    const self = {

    }

    useEffect(() => {
        if(props.extend  && props.extend.name){
            const cid = props.extend.name;
            setTemplate(cid);

            TPL.view(cid,(tpl)=>{
                //console.log(tpl);
            });
        }
    }, [props.extend]);

    return (

        <Row className="pt-2">
            <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                <Breadcrumb>
                    <Breadcrumb.Item onClick={(ev) => { props.link("home") }}>Home</Breadcrumb.Item>
                    <Breadcrumb.Item onClick={(ev) => { props.link("template", [props.extend.name]) }}>Template</Breadcrumb.Item>
                    <Breadcrumb.Item active>{template}</Breadcrumb.Item>
                </Breadcrumb>
            </Col>
            <Col md={size.header[0]} lg={size.header[0]} xl={size.header[0]} xxl={size.header[0]} >
                <PriveiwINFT id={"iNFT_preview"} hash={hash} template={template} offset={[]}  force={true}/>
                <Row>
                    <Col md={size.operation[0]} lg={size.operation[0]} xl={size.operation[0]} xxl={size.operation[0]} >
                        { tools.shorten(hash)}
                    </Col>
                    <Col className="text-end" md={size.operation[1]} lg={size.operation[1]} xl={size.operation[1]} xxl={size.operation[1]} >
                        <button className="btn btn-md btn-primary">Mock</button>
                    </Col>
                </Row>
                
            </Col>
            <Col md={size.header[1]} lg={size.header[1]} xl={size.header[1]} xxl={size.header[1]} >
                <ListSeries template={template} />
            </Col>
            <Col md={size.header[1]} lg={size.header[1]} xl={size.header[1]} xxl={size.header[1]} >
                Details of template
            </Col>
            <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                Comments List
            </Col>
        </Row>
    )
}

export default Preview;