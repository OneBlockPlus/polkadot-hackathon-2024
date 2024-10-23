import { Row, Col, Card, Placeholder } from "react-bootstrap";
import { useEffect, useState } from "react";

import Network from "../network/router";
import INFT from "../system/inft";

import tools from "../lib/tools";

let first=true;
function ListMarket(props) {
  const size = {
    row: [12],
    grid: [3],
  };

  let [list, setList] = useState([]);
  let [ready, setReady] = useState(false);
  let [info, setInfo] = useState("Loading");

  const self = {
    getHolder: (n) => {
      const arr = []
      for (let i = 0; i < n; i++) {
        arr.push({ name: "fake_" + i });
      }
      return arr;
    },
    show:()=>{
      setInfo("Getting selling iNFTs from network");
      Network("anchor").market((arr) => {
        //console.log(JSON.stringify(arr));
        setInfo("Getting template from IPFS then rendering iNFTs.");
        const nlist = self.getHolder(arr.length);
        setList(nlist);
        INFT.auto(arr,(fs)=>{
          //console.log(fs);
          setList(fs);
          setReady(true);
          if(first) props.fresh("filter");
          first=false;
        });
      });
    },
    search:(condition)=>{
      setReady(false);
      if(condition.template){
        INFT.search(condition.template,"template",(arr)=>{
          setReady(true);
          setList(arr);
        });
      }else{

      }
    },
  }

  useEffect(() => {
    if(!props.filter){
      self.show();
    }else{
      self.search(props.filter);
    }
  }, [props.filter]);

  return (
    <Row>
      <Col hidden={ready} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <h6 className="text-info">{info}</h6>
      </Col>
      {list.map((row, index) => (
        <Col className="justify-content-around pt-2" key={index} lg={size.grid[0]} xxl={size.grid[0]} md={size.grid[0]}>
          <Card hidden={!ready} className="pointer" onClick={
            (ev) => { props.link("view", [row.name]) }
          }>
            <Card.Img variant="top" src={row.bs64} />
            <Card.Body>
              <Card.Title>{row.name}</Card.Title>
              <Card.Text>
                <strong>Price: </strong> <span className="text-warning"><strong>{row.price}</strong></span> $ANK  
                <br/>
                <strong>Owner: </strong>{!row.owner?"":tools.shorten(row.owner)}
              </Card.Text>
            </Card.Body>
          </Card>

          <Card hidden={ready} style={{ width: "100%" }}>
            <Card.Img variant="top" src={`${window.location.origin}/imgs/logo.png`} />
            <Card.Body>
              <Placeholder as={Card.Title} animation="glow">
                <Placeholder xs={6} />
              </Placeholder>
              <Placeholder as={Card.Text} animation="glow">
                <Placeholder xs={7} /> <Placeholder xs={4} /> <Placeholder xs={4} />{" "}
                <Placeholder xs={6} /> <Placeholder xs={8} />
              </Placeholder>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
export default ListMarket;