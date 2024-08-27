import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

function FilterTemplate(props) {

  const size = {
    row: [12],
  };


  useEffect(() => {
    
  }, [props.update]);

  return (
      <Row>
        <Col className="pt-2" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
          <h4>Template Filter</h4>
        </Col>
        <Col className="pt-2" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
          Search by keywords
        </Col>
        <Col className="pt-2" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
          Filter by time
        </Col>
        <Col className="pt-2" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
          Filter by rarity
        </Col>
    </Row>
  );
}
export default FilterTemplate;