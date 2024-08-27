import { Row, Col,Form } from "react-bootstrap";

function SettingSample(props) {
  const size = {
    row: [12],
    head:[4,8],
    normal: [9, 3],
    left:[8,4],
    right:[4,8],
  };
  return (
    <Row>
      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <h5>iNFT Setting Sample UI</h5>
      </Col>
      
      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <hr />
      </Col>

      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <Row>
          <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
            <h6>Data Resource Selection</h6>
          </Col>

          <Col md={size.normal[0]} lg={size.normal[0]} xl={size.normal[0]} xxl={size.normal[0]}>
            Enable to get on selling iNFT from W3OS.net API
          </Col>
          <Col className="text-end" md={size.normal[1]} lg={size.normal[1]} xl={size.normal[1]} xxl={size.normal[1]}>
            <Form>
              <Form.Check // prettier-ignore
                type="switch"
                id="custom-switch"
                label="direct link to node"
                onChange={(ev)=>{
                  console.log(`Changed:${ev.target.value}`);
                }}
              />
            </Form>
          </Col>

          <Col md={size.normal[0]} lg={size.normal[0]} xl={size.normal[0]} xxl={size.normal[0]}>
            Enable to get on template data from W3OS.net API
          </Col>
          <Col className="text-end" md={size.normal[1]} lg={size.normal[1]} xl={size.normal[1]} xxl={size.normal[1]}>
            <Form>
              <Form.Check // prettier-ignore
                type="switch"
                id="custom-switch"
                label="direct link to node"
                checked
                onChange={(ev)=>{
                  console.log(`Changed:${ev.target.value}`);
                }}
              />
            </Form>
          </Col>

        </Row>
      </Col>

      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <hr />
      </Col>

      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <Row>
          <Col md={size.head[0]} lg={size.head[0]} xl={size.head[0]} xxl={size.head[0]}>
            <h6>Nodes Network</h6>
          </Col>
          <Col className="text-end" md={size.head[1]} lg={size.head[1]} xl={size.head[1]} xxl={size.head[1]}>
            feedback of action
          </Col>
          <Col md={size.normal[0]} lg={size.normal[0]} xl={size.normal[0]} xxl={size.normal[0]}>
            <Row>
              <Col md={size.right[0]} lg={size.right[0]} xl={size.right[0]} xxl={size.right[0]}>
                <select className="form-control">
                  <option value="">Network Selector</option>
                </select>
              </Col>
              <Col md={size.right[1]} lg={size.right[1]} xl={size.right[1]} xxl={size.right[1]}>
                <input className="form-control" type="text" placeholder="Adding new Network" />
              </Col>
            </Row>
          </Col>
          <Col className="text-end" md={size.normal[1]} lg={size.normal[1]} xl={size.normal[1]} xxl={size.normal[1]}>
            <button className="btn btn-md btn-primary">Add</button>
          </Col>
        </Row>
      </Col>

      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <hr />
      </Col>

      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <Row>
          <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
            <h6>Nodes Setting</h6>
          </Col>
          <Col md={size.normal[0]} lg={size.normal[0]} xl={size.normal[0]} xxl={size.normal[0]}>
            <input className="form-control" type="text" placeholder="Adding new node of Network" />
          </Col>
          <Col className="text-end" md={size.normal[1]} lg={size.normal[1]} xl={size.normal[1]} xxl={size.normal[1]}>
            <button className="btn btn-md btn-primary">Add</button>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}
export default SettingSample;