import { Container, Row, Col } from "react-bootstrap";
import { useEffect } from "react";

function Footer(props) {

  const size = {
    row: [12],
    board: [3]
  };

  useEffect(() => {
    
  }, []);

  return (
    <div className="footer">
    <Container>
      <Row className="pb-4">
        <Col className="pt-4" md={size.board[0]} lg={size.board[0]} xl={size.board[0]} xxl={size.board[0]}>
          <h5>iNFT Market ( 2024 )</h5>
        </Col>
        <Col className="pt-4" md={size.board[0]} lg={size.board[0]} xl={size.board[0]} xxl={size.board[0]}>

        </Col>
        <Col className="pt-4" md={size.board[0]} lg={size.board[0]} xl={size.board[0]} xxl={size.board[0]}>

        </Col>
        <Col className="pt-4 text-end" md={size.board[0]} lg={size.board[0]} xl={size.board[0]} xxl={size.board[0]}>
          <h5>Copyright 2024 </h5>
        </Col>
      </Row>
    </Container>
    </div>
  );
}
export default Footer;