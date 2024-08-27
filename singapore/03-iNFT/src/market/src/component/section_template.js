import { Container,Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

function SectionTemplate(props) {

  const size = {
    row: [12],
    title:[3,6,3],
    grid:[4]
  };

  let [list, setList]=useState([]);

  useEffect(() => {
    const slides=[]
    setList(slides);
}, [  ]);

  return (
    <Container className="pb-4">
      <Row>
        <Col className="pt-4" md={size.title[0]} lg={size.title[0]} xl={size.title[0]} xxl={size.title[0]}>
          <h4>Template list</h4>
        </Col>
        <Col className="pt-4" md={size.title[1]} lg={size.title[1]} xl={size.title[1]} xxl={size.title[1]}></Col>
        <Col className="pt-4 text-end" md={size.title[2]} lg={size.title[2]} xl={size.title[2]} xxl={size.title[2]}>
        <a href="template">More...</a>
        </Col>
        {list.map((row, index) => (
          <Col key={index} className="pt-2" md={size.grid[0]} lg={size.grid[0]} xl={size.grid[0]} xxl={size.grid[0]}>
            <a href={`preview/${row.cid}`}>
              <img className="inft_thumb" src={row.thumb} alt={row.alt} />
              {row.title}, {row.desc}
            </a>
          </Col>
        ))}
    </Row>
  </Container>
  );
}
export default SectionTemplate;