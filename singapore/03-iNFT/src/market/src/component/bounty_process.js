import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

import ProcessDetail from "./process_detail";

import tools from "../lib/tools";
import Bounty from "../system/bounty";
import TPL from "../system/tpl";

import API from "../system/api";

import {  FaCopy, FaFileDownload, FaSkullCrossbones } from "react-icons/fa";

function BountyProcess(props) {
  const size = {
    row: [12],
    grid:[4,4,4],
    left:[7,5],
  };

  let [data, setData] = useState({});

  let [ anchorBounty, setAnchorBounty ] = useState("");
  let [ anchorPayment, setAnchorPayment ] = useState("");
  let [ anchorAppy, setAnchorApply ] = useState("");
  let [ anchorDistribution, setAnchorDistribution] = useState("");

  const self={
    fresh:()=>{
      API.bounty.view(props.name,(res)=>{
        if(!res.success) return false;
        
        setAnchorBounty(res.data.alink);
        setData(res.data);
      });
    },
  }
  useEffect(() => {
    self.fresh();

    console.log(props);
  }, [props.data,props.index]);

  return (
    <Row>
      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
        <Row>
          <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
            <h5>Bounty details ( {anchorBounty} <FaCopy className="pointer" /> ) </h5>
          </Col>
        </Row>
        <ProcessDetail data={data}/>
      </Col>
      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} ><hr/></Col>

      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
        <Row>
          <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
            <h5>Payment details ( {anchorPayment} <FaCopy className="pointer" /> ) </h5>
          </Col>
          <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
            {data && data.payment}
          </Col>
        </Row>
      </Col>
      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} ><hr/></Col>

      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
        <Row>
          <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
            <h5>Apply details ( {anchorPayment} <FaCopy className="pointer" /> ) </h5>
          </Col>
        </Row>
      </Col>
      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} ><hr/></Col>

      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
        <Row>
          <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
            <h5>Distribution details ( {anchorPayment} <FaCopy className="pointer" /> ) </h5>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}
export default BountyProcess;