import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

import AccountSelector from "./account_selector";
import ListAddress from "./list_address";

import Page from "./common/common_page";

import API from "../system/api";
import INFT from "../system/inft";

import { FaCheck } from "react-icons/fa";

function UserINFT(props) {
  const size = {
    row: [12],
    left: [8, 4],
  };

  let [address, setAddress] = useState("");
  let [list, setList] = useState([]);

  let [show, setShow] = useState(false);
  let [now, setNow] = useState(1);            //current page
  let [total, setTotal] = useState(1);

  let [fav, setFav] = useState(false);
  let [page, setPage] = useState(1);

  const self = {
    clickFav: (ev) => {
      setFav(!fav);
      if (!fav) {
        //console.log("here");
        const step = 12;
        INFT.fav.list((res) => {
          INFT.multi(res, (ans) => {
            setList(ans);
          });
        }, page, step);
      } else {
        self.fresh(address, 1);
      }
    },
    changeAccount: (addr) => {
      if (!addr) return false;
      //console.log(`Here to fresh`);
      setAddress(addr);
      self.fresh(addr, now);
    },
    getAnchorArray: (arr) => {
      const narr = [];
      for (let i = 0; i < arr.length; i++) {
        const row = arr[i];
        narr.push({ name: row.name, block: row.block });
      }
      return narr;
    },
    fresh: (addr, p) => {
      if (!addr) return false;

      API.list.byAddress(addr, (res) => {
        if (res && res.nav && res.nav.total !== 0) {
          setShow(true);
          setTotal(res.nav.page);
        } else {
          setShow(false);
        }

        if (!res || !res.data || res.data.length === 0) return setList([]);
        const narr = self.getAnchorArray(res.data);
        console.log(JSON.stringify(narr));
        INFT.multi(narr, (ans) => {
          setList(ans);
        });
      }, p);
    },
  }

  useEffect(() => {

  }, []);

  return (
    <Row>
      <Col md={size.left[0]} lg={size.left[0]} xl={size.left[0]} xxl={size.left[0]}>
        <small>Select account to filter iNFTs</small>
        <AccountSelector disable={fav} callback={(addr) => {
          self.changeAccount(addr);
        }} />
      </Col>
      <Col className="pt-4 text-end" md={size.left[1]} lg={size.left[1]} xl={size.left[1]} xxl={size.left[1]}>

        <span>
          <button className={fav ? "btn btn-sm btn-primary mt-1" : "btn btn-sm btn-default mt-1"} onClick={(ev) => {
            self.clickFav();
          }}>
            <FaCheck />
          </button>
          <strong className="ml-10 pt-4">Fav iNFT only</strong>
        </span>
      </Col>
      <Col className="pt-2" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <ListAddress data={list} dialog={props.dialog} link={props.link} />
        <Page show={show} align={"right"} now={now} step={10} total={total} callback={(n) => {
          setNow(n);
          self.fresh(address, n)
        }} />
      </Col>
    </Row>
  );
}
export default UserINFT;