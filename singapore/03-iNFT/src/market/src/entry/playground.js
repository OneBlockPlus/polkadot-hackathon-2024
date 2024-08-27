import { Row, Col, Form } from "react-bootstrap";
import { useState, useEffect } from "react";

import PriveiwINFT from "../component/inft_preview";
import PartsINFT from "../component/inft_parts";
import SeriesINFT from "../component/inft_series";
import BasicINFT from "../component/inft_basic";
import MockOffset from "../component/mock_offset";
import MockHash from "../component/mock_hash";

import { FaEye, FaEyeSlash } from "react-icons/fa";

import TPL from "../system/tpl";

const template_orgin = {
    "IPFS": ["web3.storage"],
    "Chain": ["anchor"],
}

function Playground(props) {
    const size = {
        row: [12],
        search: [3, 6, 3],
        header: [5, 7],
        parts: [11, 1],
        mock: [6, 6],
        title: [9, 3]
    };

    let [list, setList] = useState([]);
    let [update, setUpdate] = useState(0);
    let [search, setSearch] = useState("");
    let [network, setNetwork] = useState("");        //default network
    let [enable, setEnable] = useState({
        selector: true,
        search: true,
        button: true,
    });
    let [show, setShow] = useState(false);

    let [offset, setOffset] = useState([]);        //for mock offet callback
    let [active, setActive] = useState([]);        //for mock hash, the selected hash
    let [selected, setSelected] = useState(0);      //which part to select
    let [highlight, setHighlight]= useState(true);

    //template values
    let [hash, setHash] = useState("0x6353bc102e185084671c2c1391cbb7876911e9f65cdfa46e2d9cc5f1a027a0aa");
    let [full, setFull] = useState("imgs/empty.png");
    let [parts, setParts] = useState([]);
    let [series, setSeries] = useState([]);
    let [basic, setBasic] = useState({});

    let [hideParts, setHideParts] = useState(false);
    let [hideSeries, setHideSeries] = useState(false);
    let [hideImage, setHideImage] = useState(true);
    let [hideMock, setHideMock] = useState(true);
    let [hideBasic, setHideBasic] = useState(false);

    const self = {
        changeSearch: (ev) => {
            setSearch(ev.target.value);
        },
        changeNetwork: (ev) => {
            setNetwork(ev.target.value);
        },
        // clickSample:(cid)=>{
            
        // },
        clickLoad: (ev) => {
            setShow(false);
            if (network && search) {
                TPL.view(search, (def) => {
                    self.show(def);
                });
            }
        },
        changeSelected: (index) => {
            const arr=self.getActiveHash(index);
            setActive(arr);
        },
        changeHighlight:(ev)=>{
            setHighlight(!highlight);
        },
        switchSeries: () => {
            setHideSeries(!hideSeries);
        },
        switchParts: () => {
            setHideParts(!hideParts);
        },
        switchBasic: () => {
            setHideBasic(!hideBasic);
        },
        switchImage: () => {
            setHideImage(!hideImage);
        },
        switchMock: () => {
            setHideMock(!hideMock);
        },
        getActiveHash:(index)=>{
            const part = parts[index];
            const [start, step] = part.value;
            const arr = []
            for (let i = 0; i < step; i++) {
                arr.push(start + i);
            }
            return arr;
        },
        getBasic:(def)=>{
            //console.log(def);
            return {
                cell:def.cell,
                grid:def.grid,
                size:def.size,
            }
        },
        show: (def) => {
            if (def.image) setFull(def.image);
            if (def.parts) setParts(def.parts);
            if (def.series) setSeries(def.series);
            setBasic(self.getBasic(def));
            setShow(true);
        },
        getListFromOrgin: (map) => {
            const arr = [];
            for (let from in map) {
                for (let i = 0; i < map[from].length; i++) {
                    arr.push({
                        from: from,
                        orgin: map[from][i],
                    });
                }
            }
            return arr;
        },

        fresh: () => {
            setUpdate(update + 1);
        },

        //series click
        single: (mock) => {
            setOffset(new Array(offset.length).fill(0));
            setHash(mock);
        },
    }

    useEffect(() => {
        //1.set networks
        const nlist = self.getListFromOrgin(template_orgin);
        setList(nlist);

        const selected = nlist[0];
        setNetwork(`${selected.from}::${selected.orgin}`);

        //2.check params
        if (props.extend && props.extend.template) {
            setSearch(props.extend.template);
            TPL.view(props.extend.template, (def) => {
                self.show(def);
            });
        }

    }, [props.extend]);

    return (
        <div>
            <Row className="pt-2">
                <Col md={size.search[0]} lg={size.search[0]} xl={size.search[0]} xxl={size.search[0]} >
                    <select name="" className="form-control"
                        value={network}
                        disabled={!enable.selector}
                        onChange={(ev) => {
                            self.changeNetwork(ev);
                        }}>
                        {list.map((row, index) => (
                            <option value={`${row.from}::${row.orgin}`} key={index} >{row.from}::{row.orgin}</option>
                        ))}
                    </select>
                </Col>
                <Col md={size.search[1]} lg={size.search[1]} xl={size.search[1]} xxl={size.search[1]} >
                    <small></small>
                    <input className="form-control" type="text" placeholder="The template to load"
                        disabled={!enable.search}
                        value={search} onChange={(ev) => {
                            self.changeSearch(ev);
                        }}
                    />
                </Col>
                <Col md={size.search[2]} lg={size.search[2]} xl={size.search[2]} xxl={size.search[2]} >
                    <button className="btn btn-md btn-primary"
                        disabled={!enable.button}
                        onClick={(ev) => {
                            self.clickLoad(ev);
                        }}>Load Template</button>
                </Col>

                <Col className="pt-1" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                    Sample
                    <span className="pointer ml-10 text-secondary" onClick={(ev)=>{
                        props.link("playground", ["bafkreibtt7ciqypa3vogodmdmvyd3trwajv3l7cqi43yk4hrtgpyopn2e4"]);
                    }}>bafkreibtt...</span>
                    <span className="pointer ml-10 text-secondary" onClick={(ev)=>{
                        props.link("playground", ["bafkreiddy2rqwebw5gm5hdqqqrbsqzkrubjk3ldzr2bia5jk4w5o2w5w4i"]);
                    }}>bafkreiddy...</span>
                    <span className="pointer ml-10 text-secondary" onClick={(ev)=>{
                        props.link("playground", ["bafkreie37cu5w56yak35plt4shw7xco7mxopacilbphoao6g6b4eskeuvi"]);
                    }}>bafkreie37...</span>
<span className="pointer ml-10 text-secondary" onClick={(ev)=>{
                        props.link("playground", ["bafkreid3jvmjgbdy4jyesbpjqmyde6mxvzxw427nmrqhinecc5q7o6zqqq"]);
                    }}>bafkreid3j...</span>

                </Col>
            </Row>
            <Row hidden={!show}>
                <Col className="pt-2" md={size.header[0]} lg={size.header[0]} xl={size.header[0]} xxl={size.header[0]} >
                    <PriveiwINFT 
                        id={"iNFT_view"} 
                        hash={hash} template={search} 
                        offset={offset} 
                        force={true} 
                        hightlight={!highlight?false:selected}
                    />
                    <Row className="pt-2">
                        <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                        <Form>
                            <Form.Check type="checkbox" label={`Enable highlight.`} checked={highlight} onChange={(ev) => {
                                self.changeHighlight(ev);
                            }} />
                        </Form>
                        </Col>
                    </Row>                    
                    <Row className="pt-2">
                        <Col className="pt-2" md={size.title[0]} lg={size.title[0]} xl={size.title[0]} xxl={size.title[0]} >
                            <h5 className="playground_title">iNFT Series ( {series.length} )</h5>
                        </Col>
                        <Col className="pt-2 text-end" md={size.title[1]} lg={size.title[1]} xl={size.title[1]} xxl={size.title[1]} >
                            <button className="btn btn-sm btn-light" onClick={(ev) => {
                                self.switchSeries(ev);
                            }}>{!hideSeries ? <FaEye /> : <FaEyeSlash />}</button>
                        </Col>
                        <Col hidden={hideSeries} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                            <SeriesINFT template={search} fresh={self.single} />
                        </Col>
                    </Row>
                    <Row>
                        <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                            <hr />
                        </Col>
                    </Row>
                    <Row>
                        <Col className="pt-2" md={size.title[0]} lg={size.title[0]} xl={size.title[0]} xxl={size.title[0]} >
                            <h5 className="playground_title">Orginal Image ( {full.length.toLocaleString()} Bytes )</h5>
                        </Col>
                        <Col className="pt-2 text-end" md={size.title[1]} lg={size.title[1]} xl={size.title[1]} xxl={size.title[1]} >
                            <button className="btn btn-sm btn-light" onClick={(ev) => {
                                self.switchImage(ev);
                            }}>{!hideImage ? <FaEye /> : <FaEyeSlash />}</button>
                        </Col>
                        <Col hidden={hideImage} className="pt-2" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                            <img src={full} style={{ width: "100%" }} alt="Full template." />
                        </Col>
                    </Row>
                </Col>

                <Col className="pt-2" md={size.header[1]} lg={size.header[1]} xl={size.header[1]} xxl={size.header[1]} >
                    <Row className="pt-2">
                        <Col className="pt-2" md={size.title[0]} lg={size.title[0]} xl={size.title[0]} xxl={size.title[0]} >
                            <h5 className="playground_title">Mock Data</h5>
                        </Col>
                        <Col className="text-end" md={size.title[1]} lg={size.title[1]} xl={size.title[1]} xxl={size.title[1]} >
                            <button className="btn btn-sm btn-light" onClick={(ev) => {
                                self.switchMock(ev);
                            }}>{!hideMock ? <FaEye /> : <FaEyeSlash />}</button>
                        </Col>
                        <Col hidden={hideMock} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                            <MockOffset parts={parts} hash={hash} offset={offset} selected={selected} callback={(res, act) => {
                                if (res) setOffset(res);
                                if (act !== undefined) {
                                    setSelected(act);
                                    const arr=self.getActiveHash(act);
                                    setActive(arr);
                                }
                            }} />
                        </Col>
                        <Col hidden={hideMock} className="pt-2" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                            <small>This is the mock iNFT user offset.</small>
                        </Col>
                        <Col className="pt-2" hidden={hideMock} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                            <MockHash hash={hash} active={active} callback={(nhash, act) => {
                                if (nhash) setHash(nhash);
                                if (act !== undefined) setSelected(act);
                            }} />
                        </Col>
                        <Col hidden={hideMock} className="pt-2" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                            <small>This hash mock block hash to render iNFT.
                                The hightlight chars is the value of iNFT part.</small>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                            <hr />
                        </Col>
                    </Row>

                    <Row>
                        <Col className="pt-2" md={size.title[0]} lg={size.title[0]} xl={size.title[0]} xxl={size.title[0]} >
                            <h5 className="playground_title">iNFT Basic</h5>
                        </Col>
                        <Col className="text-end" md={size.title[1]} lg={size.title[1]} xl={size.title[1]} xxl={size.title[1]} >
                            <button className="btn btn-sm btn-light" onClick={(ev) => {
                                self.switchBasic(ev);
                            }}>{!hideBasic ? <FaEye /> : <FaEyeSlash />}</button>
                        </Col>
                        <Col hidden={hideBasic} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                            <BasicINFT data={basic}/>
                        </Col>
                        <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                            <hr />
                        </Col>
                    </Row>

                    <Row className="pt-2">
                        <Col className="pt-2" md={size.title[0]} lg={size.title[0]} xl={size.title[0]} xxl={size.title[0]} >
                            <h5 className="playground_title">iNFT Parts ( {parts.length} pieces to combine iNFT )</h5>
                        </Col>
                        <Col className="text-end" md={size.title[1]} lg={size.title[1]} xl={size.title[1]} xxl={size.title[1]} >
                            <button className="btn btn-sm btn-light" onClick={(ev) => {
                                self.switchParts(ev);
                            }}>{!hideParts ? <FaEye /> : <FaEyeSlash />}</button>
                        </Col>
                        <Col hidden={hideParts} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                            <PartsINFT data={parts} selected={selected} callback={(index) => {
                                setSelected(index);
                                self.changeSelected(index);
                            }} />
                        </Col>
                    </Row>
                </Col>
            </Row>
        </div>
    )
}

export default Playground;