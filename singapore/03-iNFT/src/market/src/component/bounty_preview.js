import { Row, Col, Breadcrumb } from "react-bootstrap";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

import CommentList from "./commnet_list";
import CommentSubmit from "./commnet_submit";
import BountyBonus from "./bounty_bonus";
import BountyMinting from "./bounty_minting";

import TPL from "../system/tpl";
import API from "../system/api";

import { FaHeart, FaRegHeart } from "react-icons/fa";

function BountyPreview(props) {
  const size = {
    row: [12],
    grid: [4, 8],
    left: [5, 7],
  };

  let [data, setData] = useState({});   //template data
  let [raw, setRaw] = useState({});     //bounty data from backend

  let [coin, setCoin] = useState("");
  let [total, setTotal] = useState(0);
  let [start, setStart] = useState(0);
  let [end, setEnd] = useState(0);
  let [desc, setDesc] = useState("");

  let [update, setUpdate] = useState(0);

  let [fav, setFav] = useState(true);  //wether faved by user

  const self = {
    getAlink: () => {
      return `anchor://${self.getAnchor()}/${self.getBlock()}`;
    },
    getAnchor: () => {
      if (props.data && props.data.anchor) return props.data.anchor
      if (props.extend && props.extend.anchor) return props.extend.anchor
      return "";
    },
    getBlock: () => {
      if (props.data && props.data.block) return props.data.block
      if (props.extend && props.extend.block) return props.extend.block
      return "";
    },
    getThumb: (index) => {
      if (!data || !data.series) return false;
      const all = data.series[index];
      return all.thumb[0];
    },
    getDate: (stamp) => {
      const dd = new Date(stamp * 1000);
      return dd.toDateString() + " " + dd.toLocaleTimeString();
    },
    calcTotal: (bs) => {
      let amount = 0;
      for (let i = 0; i < bs.length; i++) {
        const row = bs[i];
        amount += row.amount * row.bonus;
      }
      return amount;
    },

    autoCache: (ck) => {
      const alink = self.getAlink();
      API.bounty.view(alink, (res) => {
        //console.log(res);
        if (!res.success || !res.data) return ck && ck(false);

        setRaw(res.data);

        //1.bounty detail
        const bs=res.data.detail.bonus;
        //console.log(bs);
        const n = self.calcTotal(bs);
        setTotal(n.toLocaleString());

        setCoin(res.data.coin);   //set the bonus coin symbol
        setStart(parseInt(res.data.start));
        setEnd(parseInt(res.data.end));

        setDesc(res.data.detail.desc);

        //2.template cache;
        TPL.view(res.data.template.cid, (dt) => {
          setData(dt);
          return ck && ck(true);
        });
      });
    },

    getBountyURL: () => {
      const base = "https://inft.w3os.net/bounty";
      if (props.data && props.data.anchor && props.data.block) return `${base}/${props.data.anchor}/${props.data.block}`;
      return base;
    },
  }

  useEffect(() => {
    self.autoCache(() => {

    });
  }, [props.data, props.extend]);

  return (
    <Row>
      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
        <Breadcrumb>
          <Breadcrumb.Item onClick={(ev) => { props.link("home") }}>Home</Breadcrumb.Item>
          <Breadcrumb.Item onClick={(ev) => { props.link("bounty") }}>Bounty</Breadcrumb.Item>
          <Breadcrumb.Item active>{self.getAlink()}</Breadcrumb.Item>
        </Breadcrumb>
      </Col>
      <Col md={size.grid[0]} lg={size.grid[0]} xl={size.grid[0]} xxl={size.grid[0]}>
        <Row>
          <Col md={size.left[0]} lg={size.left[0]} xl={size.left[0]} xxl={size.left[0]}>
            <QRCode
              bgColor={"#ffffff"}
              fgColor={"#000000"}
              title={"QR title"}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              value={self.getBountyURL()}
            />
          </Col>
          <Col md={size.left[1]} lg={size.left[1]} xl={size.left[1]} xxl={size.left[1]}>
            <Row>
              <Col className="text-end" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                <button className="btn btn-sm btn-default">
                  <FaRegHeart hidden={fav} className="text-warning" size={20} />
                  <FaHeart hidden={!fav} className="text-warning" size={20} />
                </button>
              </Col>
              <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                <p>{desc}</p>
                <p>Start from {start.toLocaleString()} to {end.toLocaleString()}</p>
              </Col>
            </Row>
          </Col>
        </Row>

        <h5 className="pt-4">Bonus ( Total {total.toLocaleString()} ${coin.toUpperCase()} )</h5>
        <BountyBonus
          raw={raw}
          template={data}
          dialog={props.dialog}
        />
        <p className="pt-2">Click thumb to view detail or divert iNFT.</p>
        <Row>
          <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
            <hr />
          </Col>
        </Row>
        <BountyMinting template={data && data.cid ? data.cid : ""} bounty={self.getAlink()} amount={20} />
      </Col>
      <Col md={size.grid[1]} lg={size.grid[1]} xl={size.grid[1]} xxl={size.grid[1]}>
        <CommentList alink={self.getAlink()} update={update} />
        <CommentSubmit alink={self.getAlink()} callback={() => {
          setUpdate(update + 1);
        }} />
      </Col>

    </Row>
  );
}
export default BountyPreview;