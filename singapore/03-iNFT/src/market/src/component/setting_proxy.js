import { Row, Col, Form } from "react-bootstrap";
import { useEffect, useState } from "react"

import ProxyMarket from "./proxy_market";

function SettingProxy(props) {
  const size = {
    row: [12],
    head: [4, 8],
    normal: [9, 3],
    left: [8, 4],
    right: [4, 8],
  };

  const self = {}

  useEffect(() => {
  }, []);

  return (
    <Row>
      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <h4>iNFT Proxy Setting</h4>
        <small>Proxy URLs for iNFT market system.</small>
      </Col>

      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}><hr /></Col>
      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <h6>Cache Proxy Server</h6>
      </Col>
      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <ProxyMarket />
      </Col>
    </Row>
  );
}
export default SettingProxy;