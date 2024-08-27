import { Row, Col, Image } from "react-bootstrap";
import { useEffect, useState } from "react";

import Config from "../system/config";
import API from "../system/api";

/* iNFT comment list
*   @param  {string}    bounty           //bounty alink
*/

function BountyComment(props) {
  const size = {
    row: [12],
    comment: [2, 10],
    left: [8, 4],
  };

  let [list, setList] = useState([]);

  const self = {
    clickMore:()=>{
      const bt=self.decode(props.bounty);
      props.link("bounty", [bt.name, bt.block]);
    },
    decode:(alink)=>{
      const str=alink.replace("anchor://","");
      const arr=str.split("/");
      const block=parseInt(arr.pop());
      if(isNaN(block)) return false;
      return {name:arr.join("/"),block:block};
    },
    getAvatar: (address) => {
      const cfg = Config.get(["system", "avatar"]);
      return `${cfg.base}/${address}.png${cfg.set}`;
    },
  }

  useEffect(() => {
    if(props.bounty){
      API.comment.list(props.bounty, (res) => {
        if(!res.success) return false;
        setList(res.data.slice(0,3).reverse());
      });
    }
  }, [props.bounty]);

  return (
    <Row>
      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <hr />
      </Col>
      <Col md={size.left[0]} lg={size.left[0]} xl={size.left[0]} xxl={size.left[0]}>
        <h5>Comments</h5>
      </Col>
      <Col className="text-end" md={size.left[1]} lg={size.left[1]} xl={size.left[1]} xxl={size.left[1]}>
        <button className="btn btn-md btn-default" onClick={(ev)=>{
          //console.log(props);
          self.clickMore();
        }}>More</button>
      </Col>
      <Col className="pt-1" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <div className="container_comment">
        {list.map((row, index) => (
          <Row className="pb-2" key={index}>
            <Col md={size.comment[0]} lg={size.comment[0]} xl={size.comment[0]} xxl={size.comment[0]}>
              <Image
                className="avatar_bounty"
                src={self.getAvatar(row.address)}
                roundedCircle
                width="100%"
              />
            </Col>
            <Col className="pt-2" md={size.comment[1]} lg={size.comment[1]} xl={size.comment[1]} xxl={size.comment[1]}>
              <div className="bounty_chat">{row.memo}</div>
            </Col>
          </Row>
        ))}
        </div>
      </Col>
    </Row>
  );
}
export default BountyComment;