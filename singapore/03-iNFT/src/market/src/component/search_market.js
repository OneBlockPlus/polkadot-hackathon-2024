import { Row, Col } from "react-bootstrap";

import { useEffect, useState } from "react";

import Network from "../network/router";
import tools from "../lib/tools";

function SearchMarket(props) {

  const size = {
    row: [12],
    search: [3, 7, 2],
    header: [4, 8]
  };

  let [list, setList] = useState([]);
  let [search, setSearch] = useState("");
  let [network, setNetwork] = useState("anchor");        //default network
  let [enable, setEnable] = useState({
    selector: true,
    search: true,
    button: true,
  });

  const self = {
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

      const chain = Network(network);
      const num = parseInt(search);
      if (!isNaN(num)) {
        chain.view(num, "blocknumber", (arr) => {
          console.log(arr);
          if(props.callback) props.callback(arr,network);
          setEnable({
            selector: true,
            search: true,
            button: true,
          })
        });
      } else {
        chain.view(search, "owner", (dt) => {
          //console.log(dt);
          if (!dt || dt.error) {
            return setEnable({
              selector: true,
              search: true,
              button: true,
            })
          }

          chain.view({ name: search, block: dt.block }, "anchor", (res) => {
            //res.blocknumber = dt.block;
            if(props.callback) props.callback([res],network);
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
    <Row>
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
        <input className="form-control" type="text" placeholder="iNFT name / block number / account ..."
          disabled={!enable.search}
          value={search} onChange={(ev) => {
            self.changeSearch(ev);
          }}
        />
      </Col>
      <Col className="pt-1 text-end" md={size.search[2]} lg={size.search[2]} xl={size.search[2]} xxl={size.search[2]}>
        <button className="btn btn-md btn-primary"
          disabled={!enable.button}
          onClick={(ev) => {
            self.clickSearch(ev);
          }}>Search</button>
      </Col>
    </Row>
  )
}

export default SearchMarket;