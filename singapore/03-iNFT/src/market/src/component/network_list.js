import { Row, Col, Table, Form } from "react-bootstrap";
import { useEffect, useState } from "react";

import { FaLightbulb, FaSkullCrossbones, FaSync } from "react-icons/fa";

import tools from "../lib/tools";
import Config from "../system/config";
import Status from "../system/status";

function NetworkList(props) {
  const size = {
    row: [12],
    head: [4, 8],
    normal: [9, 3],
    left: [8, 4],
    right: [4, 8],
  };

  let [list, setList] = useState([]);
  let [status, setStatus] = useState({});

  const self = {
    getNetworks: (map) => {
      const arr = [];
      const urls = [];
      for (var k in map) {
        const row = map[k];
        row.network = k;
        arr.push(row);
        for (let i = 0; i < row.nodes.length; i++) {
          if (!row.nodes[i]) continue;
          urls.push(row.nodes[i]);
        }
      }
      return { data: arr, urls: urls };
    },
    updateStatus: (urls) => {
      const st = Status.get(urls);
      setStatus(tools.clone(st));
    },
    getColor: (code) => {
      //console.log(code);
      let color = "grey";
      switch (code) {
        case undefined:
          break;

        case 1:
          color = "green";
          break;
        case 2:
          color = "yellow";
          break;
        case 4:
          color = "red";
          break;
        case 9:             //unknow
          //color = "red";
          break;
        case 13:
          color = "red";
          break;
        default:
          break;
      }
      return color
    },
    fresh: () => {
      const map = Config.get("network");
      const dt = self.getNetworks(map);
      setList(dt.data);

      self.updateStatus(dt.urls);
    },
  }

  useEffect(() => {
    self.fresh();
  }, [props.update]);

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Network</th>
          <th>Asset</th>
          <th>Node</th>
          <th>Type</th>
          <th>Enable</th>
          <th>Operation</th>
        </tr>
      </thead>
      <tbody>
        {list.map((row, index) => (
          <tr key={index}>
            <td>
              {row.network}
            </td>
            <td>
              {row.coin}
            </td>
            <td>
              <Row>
                {row.nodes && row.nodes.map((uri, k) => (
                  <Col key={k} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
                    <span><FaLightbulb color={self.getColor(status[uri])} /></span>
                    <span className="ml-5">{uri}</span>
                  </Col>
                ))}
              </Row>
            </td>
            <td>
              Agent
            </td>
            <td>
              <Form>
                <Form.Check // prettier-ignore
                  type="switch"
                  checked={row.enable}
                  label=""
                  onChange={(ev) => {

                  }}
                />
              </Form>
            </td>
            <td>
              <span className="pointer"><FaSkullCrossbones /></span>
              <span className="pointer ml-5"><FaSync /></span>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
export default NetworkList;