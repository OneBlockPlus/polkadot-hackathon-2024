import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

function User404(props) {
  const size = {
    row: [12],
  };

  useEffect(() => {

  }, []);

  return (
    <Row>
      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
          <h3>Not Found</h3>
      </Col>
    </Row>
  );
}
export default User404;