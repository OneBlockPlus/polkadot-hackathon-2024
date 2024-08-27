import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

import Network from "../network/router";

import tools from "../lib/tools";
import Config from "../system/config";

function BountyMore(props) {
  const size = {
    row: [12],
    half: [5],
    step: [2, 10],
    head: [4, 8],
    normal: [9, 3],
  };

  //submission details
  let [title, setTitle] = useState("");
  let [desc, setDesc] = useState("");
  let [start, setStart] = useState(0);
  let [end, setEnd] = useState(0);
  let [coin, setCoin] = useState("ank");
  let [consignee, setConsignee] = useState("");

  let [coins, setCoins] = useState([]);
  let [block, setBlock] = useState(0);

  let [disable, setDisable] = useState(true);

  const self = {
    changeTitle: (ev) => {
      setTitle(ev.target.value);
      self.submit();
    },
    changeStart: (ev) => {
      setStart(parseInt(ev.target.value));
      self.submit();
    },
    changeEnd: (ev) => {
      setEnd(parseInt(ev.target.value));
      self.submit();
    },
    changeCoin: (ev) => {
      const val = ev.target.value;
      setCoin(val.toLocaleLowerCase());
      self.submit();
    },
    changeDesc: (ev) => {
      setDesc(ev.target.value);
      self.submit();
    },
    changeAcceptor:(ev)=>{
      setConsignee(ev.target.value);
      self.submit();
    },
    submit:()=>{
      if(props.callback) props.callback(self.getMoreData());
    },
    getMoreData: () => {
      return {
        title: title,
        desc: desc,
        coin: coin,
        start: start,
        end: end,
        consignee:consignee,
      };
    },
    getCoins: () => {
      const cs = Config.get("network");
      //console.log(cs);
      const arr = [];
      for (let k in cs) {
        const row = cs[k];
        if (row.support && row.support.bonus) arr.push({
          coin: row.coin,
          network: k,
        });
      }
      return arr;
    },
    load: (bt) => {
      //1.set details value
      if (bt.title) setTitle(bt.title);
      if (bt.desc) setDesc(bt.desc);
      if (bt.start) setStart(bt.start);
      if (bt.end) setEnd(bt.end);
      if (bt.coin) setCoin(bt.coin);
        
      const cs = self.getCoins();
      setCoins(cs);

      setDisable(!bt.name?false:true);
    },
  }

  useEffect(() => {
    self.load(props.bounty);
    Network("anchor").subscribe("bounty_submit", (bk, hash) => {
      setBlock(bk);
      if(start===0 && end===0){
        setStart(bk + 10000);
        setEnd(bk + 30000);
      }
    });

  }, [props.bounty]);

  return (
    <Row>
      <Col md={size.normal[0]} lg={size.normal[0]} xl={size.normal[0]} xxl={size.normal[0]}>
        <small>The title of bounty</small>
        <input type="text" disabled={disable} className="form-control" placeholder="Input the title of bounty"
          value={title} onChange={(ev) => {
            self.changeTitle(ev);
          }} />
      </Col>
      <Col md={size.normal[1]} lg={size.normal[1]} xl={size.normal[1]} xxl={size.normal[1]}>
        <small>Bonus coin</small>
        <select className="form-control" disabled={disable} value={coin.toUpperCase()} onChange={(ev) => {
          self.changeCoin(ev);
        }}>
          {coins.map((row, index) => (
            <option key={index} value={row.coin}>{tools.toUp(row.network)}: {row.coin}</option>
          ))}
        </select>
      </Col>

      <Col className="pt-2" md={size.normal[0]} lg={size.normal[0]} xl={size.normal[0]} xxl={size.normal[0]}>
        <small>Details about the bounty.</small>
        <textarea className="form-control" disabled={disable}  cols={4} placeholder="The details of the bounty." value={desc} onChange={(ev) => {
          self.changeDesc(ev);
        }}></textarea>
      </Col>
      <Col md={size.normal[1]} lg={size.normal[1]} xl={size.normal[1]} xxl={size.normal[1]}>
      </Col>

      <Col className="pt-2" md={size.normal[0]} lg={size.normal[0]} xl={size.normal[0]} xxl={size.normal[0]}>
        <small>The account address to accept the bonus iNFT result.</small>
        <input className="form-control" type="text" disabled={disable} placeholder="The account to accept iNFTs." onChange={(ev)=>{
          self.changeAcceptor(ev);
        }}/>
      </Col>
      <Col md={size.normal[1]} lg={size.normal[1]} xl={size.normal[1]} xxl={size.normal[1]}>
      </Col>

      <Col md={size.half[0]} lg={size.half[0]} xl={size.half[0]} xxl={size.half[0]}>
        <small>Bounty start at block</small>
        <input type="number" disabled={disable} className="form-control" placeholder="Start of bounty"
          value={start} onChange={(ev) => {
            self.changeStart(ev);
          }} />
      </Col>

      <Col md={size.half[0]} lg={size.half[0]} xl={size.half[0]} xxl={size.half[0]}>
        <small>Bounty end at block</small>
        <input type="number" disabled={disable} className="form-control" placeholder="End of bounty"
          value={end} onChange={(ev) => {
            self.changeEnd(ev);
          }} />
      </Col>

      <Col className="" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        Current block number: {block.toLocaleString()}, {6}s per block.
      </Col>

      
    </Row>
  );
}
export default BountyMore;