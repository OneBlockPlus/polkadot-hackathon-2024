import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

import SVGGrid from "./svg_grid";

function BasicINFT(props) {
  const size = {
    row: [12],
    grid: [4],
    schema:[2,8,2],
    cell:[3,6,3],
    matrix:[3,6,3],
  };


  let [x, setX]=useState(8);
  let [y, setY]=useState(6);

  let [w, setW]=useState(900);
  let [h, setH]=useState(900);

  let [cx,setCX]=useState(50);
  let [cy,setCY]=useState(50);

  const self={
    calcGridWidth:(x)=>{
      if(x===0) return 10;
      return 10*8/x;
    },
  }

  useEffect(() => {
    console.log(props.data);
    if(props.data.grid){
      setX(props.data.grid[0]);
      setY(props.data.grid[1]);
    }

    if(props.data.cell){
      setCX(props.data.cell[0]);
      setCY(props.data.cell[1]);
    }

    if(props.data.size){
      setW(props.data.size[0]);
      setH(props.data.size[1]);
    }
    
  },[props.data]);

  return (
    <Row className="pt-2">
      <Col md={size.grid[0]} lg={size.grid[0]} xl={size.grid[0]} xxl={size.grid[0]}>
          <Row>
            <Col className="pb-2" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
              <strong>iNFT Size ( {w} * {h} )</strong>
            </Col>
            <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
              <svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="120" height="120" fill="#e3f3ab" stroke="black" strokeWidth="1" />
              </svg>
            </Col>
          </Row>
      </Col>
      <Col md={size.grid[0]} lg={size.grid[0]} xl={size.grid[0]} xxl={size.grid[0]}>
          <Row>
            <Col className="pb-2" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
              <strong>Cell Size ( {cx} * {cy} )</strong>
            </Col>
            <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
            <svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="80" height="80" fill="#e3f3ab" stroke="black" strokeWidth="1" />
              </svg>
            </Col>
          </Row>
      </Col>
      <Col md={size.grid[0]} lg={size.grid[0]} xl={size.grid[0]} xxl={size.grid[0]}>
          <Row>
            <Col className="pb-2" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
              <strong>Orginal Image Grid ( {x} * {y} )</strong>
            </Col>
            <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
              <SVGGrid 
                x={x} 
                y={y} 
                width={self.calcGridWidth(x)} background={"#e3f3ab"}/>
            </Col>
          </Row>
      </Col>
      <Col className="pt-2" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        Template basic parameters, raw: {JSON.stringify(props.data)}
      </Col>
    </Row>
  );
}
export default BasicINFT;