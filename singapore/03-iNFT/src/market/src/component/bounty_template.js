import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

function BountyTemplate(props) {
  const size = {
    row: [12],
    single: [3],
    grid: [4, 8],
    series: [5, 7],
  };

  let [series, setSeries] = useState([]);

  const self = {
    getParts:()=>{
      if(!props.data || !props.data.parts) return 0;
      return props.data.parts.length;
    },
    fresh:()=>{
      const dt = props.data;
      if(dt.series) setSeries(dt.series);
    },
  }
  
  useEffect(() => {
    self.fresh();
  }, [props.data]);

  return (
    <Row className="pt-2">
      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <hr />
      </Col>
      <Col md={size.grid[0]} lg={size.grid[0]} xl={size.grid[0]} xxl={size.grid[0]}>
        Template Details: {self.getParts()} parts.
      </Col>
      <Col md={size.grid[1]} lg={size.grid[1]} xl={size.grid[1]} xxl={size.grid[1]}>
        <Row className="">
          {series.map((row, index) => (
            <Col key={index} md={size.single[0]} lg={size.single[0]} xl={size.single[0]} xxl={size.single[0]}>
              <img className="series_thumb" src={row.thumb[0]} alt={row.name} />
              {row.name}
            </Col>
          ))}
        </Row>
      </Col>
    </Row>
  );
}
export default BountyTemplate;