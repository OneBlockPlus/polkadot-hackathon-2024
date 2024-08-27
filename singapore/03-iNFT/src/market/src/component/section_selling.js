import { Container,Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

function SectionSelling(props) {

  const size = {
    row: [12],
    title:[3,6,3],
    grid:[3]
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
        anchor:"abc_a"
      },
      {
        block:323446,
        owner:"5D5K7bHqrjqEMd9sgNeb28w9TsR8hFTTHYs6KTGSAZBhcePg",
        template:"",
        price:2,
        thumb:"thumb/inft_02.jpg",
        alt:"",
        anchor:"abc_b"
      },
      {
        block:323446,
        owner:"5D5K7bHqrjqEMd9sgNeb28w9TsR8hFTTHYs6KTGSAZBhcePg",
        template:"",
        price:2,
        thumb:"thumb/inft_03.jpg",
        alt:"",
        anchor:"abc_c"
      },
      {
        block:323446,
        owner:"5D5K7bHqrjqEMd9sgNeb28w9TsR8hFTTHYs6KTGSAZBhcePg",
        template:"",
        price:2,
        thumb:"thumb/inft_04.jpg",
        alt:"",
        anchor:"abc_d"
      },
      {
        block:323446,
        owner:"5D5K7bHqrjqEMd9sgNeb28w9TsR8hFTTHYs6KTGSAZBhcePg",
        template:"",
        price:2,
        thumb:"thumb/inft_05.jpg",
        alt:"",
        anchor:"abc_1"
      },
      {
        block:323446,
        owner:"5D5K7bHqrjqEMd9sgNeb28w9TsR8hFTTHYs6KTGSAZBhcePg",
        template:"",
        price:2,
        thumb:"thumb/inft_06.jpg",
        alt:"",
        anchor:"abc_2"
      },
      {
        block:323446,
        owner:"5D5K7bHqrjqEMd9sgNeb28w9TsR8hFTTHYs6KTGSAZBhcePg",
        template:"",
        price:2,
        thumb:"thumb/inft_07.jpg",
        alt:"",
        anchor:"abc_3"
      },
      {
        block:323446,
        owner:"5D5K7bHqrjqEMd9sgNeb28w9TsR8hFTTHYs6KTGSAZBhcePg",
        template:"",
        price:3,
        thumb:"thumb/inft_08.jpg",
        alt:"",
        anchor:"abc_4"
      },
    ]
    setList(slides);
}, [  ]);

  return (
    <Container className="pb-4">
      <Row>
        <Col className="pt-4" md={size.title[0]} lg={size.title[0]} xl={size.title[0]} xxl={size.title[0]}>
          <h4>On selling list</h4>
        </Col>
        <Col className="pt-4" md={size.title[1]} lg={size.title[1]} xl={size.title[1]} xxl={size.title[1]}></Col>
        <Col className="pt-4 text-end" md={size.title[2]} lg={size.title[2]} xl={size.title[2]} xxl={size.title[2]}>
          <a href="market">More...</a>
        </Col>
        {list.map((row, index) => (
          <Col key={index} className="pt-2" md={size.grid[0]} lg={size.grid[0]} xl={size.grid[0]} xxl={size.grid[0]}>
              <a href={`detail/${row.anchor}`}>
                <img className="inft_thumb" src={row.thumb} alt={row.alt} />
              </a>
              {row.block}, price: {row.price} $INFT       
          </Col>
        ))}
    </Row>
  </Container>
  );
}
export default SectionSelling;