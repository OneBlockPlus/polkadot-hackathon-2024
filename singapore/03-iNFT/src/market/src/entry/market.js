import {  Row, Col } from "react-bootstrap";
import { useState } from "react";

import FilterMarket from "../component/filter_market";
import ListMarket from "../component/list_market";
import SearchMarket from "../component/search_market";
import ListNFTs from "../component/list_nfts";

function Market(props) {
    const size = {
        row: [12],
        head: [7,5]
    };

    let [update ,setUpdate]=useState(0);
    let [filter, setFilter]=useState();
    let [market, setMarket]=useState(true);

    let [data, setData] = useState([]);
    let [network, setNetwork] = useState("anchor");        //default network

    const self = {
        fresh: (target) => {
            setUpdate(update+1);
        },
        filter:(map)=>{
            setFilter(map);
        },
    }
    return (
        <Row className="pt-2">
            <Col md={size.head[0]} lg={size.head[0]} xl={size.head[0]} xxl={size.head[0]} >
                <SearchMarket callback={(arr,net)=>{
                    setData(arr);
                    setNetwork(net);
                    setMarket(false);
                }} />
            </Col>
            <Col className="text-end" md={size.head[1]} lg={size.head[1]} xl={size.head[1]} xxl={size.head[1]} >
                
                <FilterMarket update={update}  filter={(condition)=>{
                    self.filter(condition);
                    setMarket(true);
                }}/>
            </Col>
            <Col hidden={!market} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
                <ListMarket fresh={self.fresh} link={props.link} filter={filter}/>
            </Col>
            <Col hidden={market} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
                <ListNFTs data={data} network={network} />
            </Col>
        </Row>
    )
}

export default Market;