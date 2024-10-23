import { useState, useEffect } from "react";
import { Row, Col } from "react-bootstrap";

function Mnemonic(props) {
  let [list, setList] = useState([]);

  useEffect(() => {
    setList(props.words);
  }, []);
  const cmap = {
    width: "100%",
  };
  return (
    <Row>
      {list.map((item, index) => (
        <Col lg={4} xs={4} key={index}>
          <h4>
            <span className="badge bg-info" style={cmap}>
              {item}
            </span>
          </h4>
        </Col>
      ))}
    </Row>
  );
}
export default Mnemonic;
