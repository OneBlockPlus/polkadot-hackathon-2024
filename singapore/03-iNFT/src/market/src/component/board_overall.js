import { Container,Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

function BoardOverall(props) {

  const size = {
    row: [12],
    board:[3]
  };

  let [list, setList]=useState([]);

  useEffect(() => {
    const slides=[
      {
        block:123456,
        owner:"5D5K7bHqrjqEMd9sgNeb28w9TsR8hFTTHYs6KTGSAZBhcePg",
        template:"",
        price:2,
        thumb:"thumb/inft_01.jpg",
        alt:"",
      },
      {
        block:323446,
        owner:"5D5K7bHqrjqEMd9sgNeb28w9TsR8hFTTHYs6KTGSAZBhcePg",
        template:"",
        price:2,
        thumb:"thumb/inft_02.jpg",
        alt:"",
      },
    ]
    setList(slides);
}, [  ]);

  return (
    <Container>
      <Row className="pb-4">
        <Col className="pt-4" md={size.board[0]} lg={size.board[0]} xl={size.board[0]} xxl={size.board[0]}>
          Total: 2.2M
        </Col>
        <Col className="pt-4" md={size.board[0]} lg={size.board[0]} xl={size.board[0]} xxl={size.board[0]}>
          Today: 28K
        </Col>
        <Col className="pt-4" md={size.board[0]} lg={size.board[0]} xl={size.board[0]} xxl={size.board[0]}>
          Today: 28K
        </Col>
        <Col className="pt-4" md={size.board[0]} lg={size.board[0]} xl={size.board[0]} xxl={size.board[0]}>
          Gas: 9.3M
        </Col>
    </Row>
  </Container>
  );
}
export default BoardOverall;