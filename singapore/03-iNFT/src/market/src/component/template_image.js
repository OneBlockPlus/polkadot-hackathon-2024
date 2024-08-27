import { Row, Col, Table } from "react-bootstrap";
import { useState, useEffect } from "react";

import { FaChevronUp, FaChevronDown } from "react-icons/fa";

function TemplateImage(props) {
  const size = {
    row: [12],
    head: [10, 2],
  };

  let [packed, setPacked] = useState(true);
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
        Template part image parameters, raw: {JSON.stringify(props.data)}
      </Col>
      <Col className="text-end" md={size.head[1]} lg={size.head[1]} xl={size.head[1]} xxl={size.head[1]}>
        <button className="btn btn-sm btn-default" onClick={(ev) => {
          self.clickPack()
        }}>
          {packed ? <FaChevronDown /> : <FaChevronUp />}
        </button>
      </Col>

      <Col hidden={packed} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <Table>
          <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
              <th>Definition</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>part.img[0]</td>
              <td>{props.data && props.data[0]}</td>
              <td>Image row to select from</td>
            </tr>
            <tr>
              <td>part.img[1]</td>
              <td>{props.data && props.data[1]}</td>
              <td>Image line to select from</td>
            </tr>
            <tr>
              <td>part.img[2]</td>
              <td>{props.data && props.data[2]}</td>
              <td>Image cell X extend amount</td>
            </tr>
            <tr>
              <td>part.img[3]</td>
              <td>{props.data && props.data[3]}</td>
              <td>Image cell Y extend amount</td>
            </tr>
          </tbody>
        </Table>
      </Col>
      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>

      </Col>
    </Row>
  );
}
export default TemplateImage;