import { Row, Col, Card, Placeholder } from "react-bootstrap";
import { useEffect, useState } from "react";

import BountyShow from "./bounty_show";

import API from "../system/api";
import TPL from "../system/tpl";

function BountyList(props) {
  const size = {
    row: [12],
    grid: [3, 4, 5],
  };

  let [page, setPage] = useState(1);
  let [list, setList] = useState([]);
  let [ready, setReady] = useState(false);

  const self = {
    getHolder: (n) => {
      const arr = []
      for (let i = 0; i < n; i++) {
        arr.push({ name: "fake_" + i });
      }
      return arr;
    },
    decode:(alink)=>{
      const str=alink.replace("anchor://","");
      const arr=str.split("/");
      const block=parseInt(arr.pop());
      if(isNaN(block)) return false;
      return {name:arr.join("/"),block:block};
    },
    prepareData:(list,ck,bts)=>{
      if(!bts) bts=[];
      if(list.length===0) return ck && ck(bts);
      const row=list.pop();
      const tp=row.template;
      const anchor=self.decode(row.alink);
      row.name=anchor.name;
      row.block=anchor.block;
      TPL.view(tp.cid,(dt)=>{
        row.template.raw=dt;
        bts.push(row);
        return self.prepareData(list,ck,bts);
      })
    },
  }

  useEffect(() => {
    const hlist = self.getHolder(1);
    setList(hlist);

    setTimeout(()=>{
      API.bounty.list((res)=>{
        if(res && res.success && res.data){
          self.prepareData(res.data,(bts)=>{
            setList(bts);
            setReady(true);
          });
        }
      },page);
    },300);
  }, [props.update]);

  return (
    <Row>
      {list.map((row, index) => (
        <Col className="justify-content-around pt-2" key={index} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
          <BountyShow data={row} link={props.link} dialog={props.dialog}/>
        </Col>
      ))}
      <Col hidden={ready} className="justify-content-around pt-2" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
        <Row>
          <Col md={size.grid[0]} lg={size.grid[0]} xl={size.grid[0]} xxl={size.grid[0]}>
            <Card style={{ width: "100%" }}>
              <Card.Img variant="top" src="" />
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
          <Col md={size.grid[1]} lg={size.grid[1]} xl={size.grid[1]} xxl={size.grid[1]}>
            <Placeholder as={Card.Title} animation="glow">
              <Placeholder xs={12} />
              <Placeholder xs={12} />
            </Placeholder>
          </Col>
          <Col md={size.grid[2]} lg={size.grid[2]} xl={size.grid[2]} xxl={size.grid[2]}>
            <Placeholder as={Card.Title} animation="glow">
              <Placeholder xs={6} />
              <Placeholder xs={6} />
            </Placeholder>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}
export default BountyList;