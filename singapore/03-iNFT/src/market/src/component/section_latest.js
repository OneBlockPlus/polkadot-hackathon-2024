import { Container,Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

function SectionLatest(props) {

  const size = {
    row: [12],
    grid:[2]
  };

  let [list, setList]=useState([]);

  useEffect(() => {
    const slides=[
      {
        anchor:"imntvugskaod_280",
        block:123456,
        owner:"5D5K7bHqrjqEMd9sgNeb28w9TsR8hFTTHYs6KTGSAZBhcePg",
        template:"",
        price:2,
        thumb:"thumb/inft_01.jpg",
        alt:"",
      },
      {
        anchor:"imntvugskaod_279",
        block:323446,
        owner:"5D5K7bHqrjqEMd9sgNeb28w9TsR8hFTTHYs6KTGSAZBhcePg",
        template:"",
        price:2,
        thumb:"thumb/inft_02.jpg",
        alt:"",
      },
      {
        anchor:"imntvugskaod_278",
        block:123456,
        owner:"5D5K7bHqrjqEMd9sgNeb28w9TsR8hFTTHYs6KTGSAZBhcePg",
        template:"",
        price:2,
        thumb:"thumb/inft_01.jpg",
        alt:"",
      },
      {
        anchor:"imntvugskaod_277",
        block:323446,
        owner:"5D5K7bHqrjqEMd9sgNeb28w9TsR8hFTTHYs6KTGSAZBhcePg",
        template:"",
        price:2,
        thumb:"thumb/inft_02.jpg",
        alt:"",
      },
      {
        anchor:"imntvugskaod_276",
        block:123456,
        owner:"5D5K7bHqrjqEMd9sgNeb28w9TsR8hFTTHYs6KTGSAZBhcePg",
        template:"",
        price:2,
        thumb:"thumb/inft_01.jpg",
        alt:"",
      },
      {
        anchor:"imntvugskaod_275",
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
      <Row>
        <Col className="pt-4" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
          <h4>Latest iNFT Mint Result</h4>
        </Col>
        {list.map((row, index) => (
          <Col key={index} className="pt-2" md={size.grid[0]} lg={size.grid[0]} xl={size.grid[0]} xxl={size.grid[0]} >
            <a href={`view/${row.anchor}`}>
              <img className="inft_thumb" src={row.thumb} alt={row.alt} />
            </a>
            {row.block}, price: {row.price} $INFT
          </Col>
        ))}
    </Row>
  </Container>
  );
}
export default SectionLatest;