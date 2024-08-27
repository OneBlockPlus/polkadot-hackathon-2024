import { Row, Col, Form } from "react-bootstrap";
import { useEffect, useState } from "react";

import Solana from "./opt_solana";
import AptOS from "./opt_aptos";
import Tanssi from "./opt_tanssi";
import Local from "./opt_local";
import Web3storage from "./opt_web3storage";

let selected_network="WEB3";     //keep the network select state, avoid to be freshed.

function Multi(props) {
    const size = {
        head: [7, 5],
        row: [12],
    };

    const map = {
        WEB3:{
            desc: "Web3 storage (IPFS)",
            tpl: <Web3storage fresh={props.fresh} update={props.update} />,
            SDK: null,
        },
        INFT: {
            desc: "Tanssi Appchain",
            tpl: <Tanssi fresh={props.fresh} update={props.update} />,
            SDK: null,
        },
        DOT: {
            desc: "Local Substrate",
            tpl: <Local fresh={props.fresh} update={props.update} />,
            SDK: null,
        },
        SOL: {
            desc: "Solana Network",
            tpl: <Solana fresh={props.fresh} update={props.update} />,
            SDK: null,
        },
        APT: {
            desc: "Aptos Network",
            tpl: <AptOS fresh={props.fresh} update={props.update} />,
            SDK: null,
        },
        IPFS: {
            desc: "IPFS Network",
            tpl: <Solana fresh={props.fresh} update={props.update} />,
            SDK: null,
        },
        ANK:{
            desc: "Anchor Network",
            tpl: <Solana fresh={props.fresh} update={props.update} />,
            SDK: null, 
        }
    }

    let [list, setList] = useState([]);
    let [panel, setPanel] = useState("");
    let [subscribe,setSubscribe]= useState(false);

    const self = {
        getNetworks: (obj) => {
            const nlist = []
            for (var k in obj) {
                const row = obj[k];
                nlist.push({
                    name: k,
                    desc: row.desc,
                });
            }
            return nlist;
        },
        changeSubscribe:(ev)=>{
            setSubscribe(!subscribe);
            props.fresh();
        },
        changeNetwork:(ev)=>{
            const val=ev.target.value;
            if(!map[val]) return false;
            const tpl=map[val].tpl;
            setPanel(tpl);
            selected_network=val;
        },
    };

    useEffect(() => {
        const nlist = self.getNetworks(map);
        setList(nlist);
        setPanel(map[selected_network].tpl);

    }, [props.update]);

    return (
        <Row className="pt-2">
            <Col lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                <h5>Storage to Chain</h5>
            </Col>
            <Col lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                <select className="form-control" onChange={(ev)=>{
                    self.changeNetwork(ev)
                }} defaultValue={selected_network}>
                    {list.map((row, index) => (
                        <option key={index} value={row.name}>{row.desc}</option>
                    ))}
                </select>
            </Col>
            {/* <Col className="text-end" lg={size.head[1]} xl={size.head[1]} xxl={size.head[1]} >
                <Form className="pt-2">
                    <Form.Check type="checkbox" 
                        label={`Enable Subscribe.`} 
                        checked={subscribe} 
                        onChange={(ev) => {
                            self.changeSubscribe(ev);
                        }}
                    />
                </Form>
            </Col> */}
            <Col lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                {panel}
            </Col>
        </Row>
    )
}

export default Multi;