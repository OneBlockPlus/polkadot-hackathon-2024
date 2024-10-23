import { Row, Col } from "react-bootstrap";

import { useEffect,useState } from "react";

import Network from "../network/router";
import tools from "../lib/tools";

import ListNFTs from "../component/list_nfts";

//Anchor Network 13598
//Tanssi Network 411191

function Explorer(props) {

    const size = {
        row: [12],
        search: [3, 5, 4],
        header: [4, 8]
    };

    let [ list, setList]=useState([]);
    let [search, setSearch] = useState("");
    let [network, setNetwork] = useState("anchor");        //default network
    let [enable, setEnable] = useState({
        selector: true,
        search: true,
        button: true,
    });

    let [data, setData] = useState([]);
    let [amount, setAmount] = useState(0);

    const self={
        changeSearch: (ev) => {
            setSearch(ev.target.value);
        },
        changeNetwork: (ev) => {
            setNetwork(ev.target.value);
        },
        clickSearch: (ev) => {
            setEnable({
                selector: false,
                search: false,
                button: false,
            })

            const api = Network(network);
            const num = parseInt(search);
            if (!isNaN(num)) {
                api.view(num, "blocknumber", (arr) => {
                    console.log(arr);
                    for (let i = 0; i < arr.length; i++) {
                        arr[i].blocknumber = num;
                    }
                    setData(arr);
                    setAmount(arr.length);
                    setEnable({
                        selector: true,
                        search: true,
                        button: true,
                    })
                });
            } else {
                api.view(search,"owner",(dt)=>{
                    console.log(dt);
                    if(!dt || dt.error){
                        return setEnable({
                            selector: true,
                            search: true,
                            button: true,
                        })
                    }

                    api.view({name:search,block:dt.block},"anchor",(res)=>{
                        res.blocknumber=dt.block;
                        setData([res]);
                        setAmount(1);
                        setEnable({
                            selector: true,
                            search: true,
                            button: true,
                        });
                    });
                });
            }
        },
        getNetworks: () => {
            const ns = Network();
            const arr = [];
            for (var key in ns) {
                if (ns[key] !== null) arr.push(key);
            }
            return arr;
        },
    }

    useEffect(() => {
        const ns = self.getNetworks();
        setList(ns);
    }, []);

    return (
        <Row className="pt-2">
            <Col className="pt-1" md={size.search[0]} lg={size.search[0]} xl={size.search[0]} xxl={size.search[0]}>
                <select name="" className="form-control"
                    value={network}
                    disabled={!enable.selector}
                    onChange={(ev) => {
                        self.changeNetwork(ev);
                    }}>
                    {list.map((row, index) => (
                        <option value={row} key={index} >{tools.toUp(row)} Network</option>
                    ))}
                </select>
            </Col>
            <Col className="pt-1" md={size.search[1]} lg={size.search[1]} xl={size.search[1]} xxl={size.search[1]}>
                <input className="form-control" type="text" placeholder="Input iNFT name or block number to search..."
                    disabled={!enable.search}
                    value={search} onChange={(ev) => {
                        self.changeSearch(ev);
                    }}
                />
            </Col>
            <Col className="pt-1" md={size.search[2]} lg={size.search[2]} xl={size.search[2]} xxl={size.search[2]}>
                <button className="btn btn-md btn-primary"
                    disabled={!enable.button}
                    onClick={(ev) => {
                        self.clickSearch(ev);
                    }}>Search</button>
            </Col>
            <Col className="pt-1" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
                <ListNFTs data={data} network={network} />
            </Col>
        </Row>
    )
}

export default Explorer;