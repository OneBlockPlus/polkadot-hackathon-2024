import { Row, Col, Table } from "react-bootstrap";
import { useState, useEffect } from "react";

import { FaChevronUp, FaChevronDown } from "react-icons/fa";

function TemplateValue(props) {
  const size = {
    row: [12],
    head: [10, 2],
  };

  let [packed, setPacked] = useState(false);
  const self = {
    clickPack: () => {
      setPacked(!packed);
    },
  }

  useEffect(() => {

  }, []);

  return (
    <Row>
      <Col md={size.head[0]} lg={size.head[0]} xl={size.head[0]} xxl={size.head[0]}>
        Template part value parameters, raw: {JSON.stringify(props.data)}
      </Col>
      <Col className="text-end" md={size.head[1]} lg={size.head[1]} xl={size.head[1]} xxl={size.head[1]}>
        <button className="btn btn-sm btn-default" onClick={(ev) => {
          self.clickPack()
        }}>
          {packed ? <FaChevronDown /> : <FaChevronUp />}
        </button>
      </Col>

      <Col hidden={packed} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <Table className="hover">
          <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
              <th>Definition</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>part.value[0]</td>
              <td>{props.data && props.data[0]}</td>
              <td>Start position of hash</td>
            </tr>
            <tr>
              <td>part.value[1]</td>
              <td>{props.data && props.data[1]}</td>
              <td>Step to split hash</td>
            </tr>
            <tr>
              <td>part.value[2]</td>
              <td>{props.data && props.data[2]}</td>
              <td>Amount to get result</td>
            </tr>
            <tr>
              <td>part.value[3]</td>
              <td>{props.data && props.data[3]}</td>
              <td>Offset added to the result</td>
            </tr>
          </tbody>
        </Table>
      </Col>
      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}></Col>
    </Row>
  );
}
export default TemplateValue;