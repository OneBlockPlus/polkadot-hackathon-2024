import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

import tools from "../lib/tools";
import Bounty from "../system/bounty";
import TPL from "../system/tpl";

import API from "../system/api";

import {  FaCopy, FaFileDownload, FaSkullCrossbones } from "react-icons/fa";

function ProcessDetail(props) {
  const size = {
    row: [12],
  };

  const self={
    calcTotal:(arr)=>{
      return 0;
    },
  }
  useEffect(() => {
    console.log(props.data);
  }, [props.data]);

  return (
    <Row>
      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
        <p>
          From {!props.data.start?0:parseInt(props.data.start).toLocaleString()} to {!props.data.end?0:parseInt(props.data.end).toLocaleString()} by Account 
          <br />
          Date:
        </p>
      </Col>
      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
        Total bonus {"$"}{!props.data.coin?"":props.data.coin.toUpperCase()} {self.calcTotal(props.data.bonus)}
      </Col>
      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
        
      </Col>
    </Row>
  );
}
export default ProcessDetail;