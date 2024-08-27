import { Row, Col, Image } from "react-bootstrap";
import { useEffect, useState } from "react";

import Network from "../network/router";
import INFT from "../system/inft";

/* iNFT minting list
*   @param  {string}    template           //template cid
*   @param  {string}    bounty             //bounty_name
*   @param  {number}    amount             //amount to show, default=4
*/

function BountyMinting(props) {
  const size = {
    row: [12],
    grid: [3],
    right: [4, 8],
  };

  let [list, setList] = useState([{ bs64: `${window.location.origin}/imgs/logo.png` }]);
  let [info, setInfo] = useState("");

  const self = {
    filterINFTs: (arr, cid) => {
      //console.log(cid);
      const full = [];
      const limit=!props.amount?4:props.amount
      for (let i = 0; i < arr.length; i++) {
        const row = arr[i];
        if (row.raw.tpl === cid) {
          full.push(row);
          if (full.length === limit) return full;
        }
      }
      return full;
    },
  }


  useEffect(() => {
    const chain = Network("anchor");
    chain.subscribe(`minting_${props.bounty}`, (block, hash) => {
      if (props.template) {
        chain.view(hash, "detail", (infts) => {
          if (infts.length === 0) {
            setList([{ bs64: `${window.location.origin}/imgs/logo.png` }]);
            return setInfo(`0 iNFT on block ${block.toLocaleString()}`);
          }
          const arr = self.filterINFTs(infts, props.template);

          for(let i=0;i<arr.length;i++){
            arr[i].block=block;
          }

          INFT.auto(arr, (fs) => {
            setInfo(`${infts.length} iNFTs on block ${block.toLocaleString()}`);
            if (fs.length === 0) {
              return setList([{ bs64: `${window.location.origin}/imgs/logo.png` }]);
            }
            setList(fs);
          });
        });
      }
    });
  }, [props.template]);

  return (
    <Row>
      <Col md={size.right[0]} lg={size.right[0]} xl={size.right[0]} xxl={size.right[0]}>
        <h5>Minting</h5>
      </Col>
      <Col className="text-end" md={size.right[1]} lg={size.right[1]} xl={size.right[1]} xxl={size.right[1]}>
        {info}
      </Col>
      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <Row>
          {list.map((row, index) => (
            <Col className="pt-2" key={index} md={size.grid[0]} lg={size.grid[0]} xl={size.grid[0]} xxl={size.grid[0]}>
              <Image
                src={row.bs64}
                rounded
                width="100%"
                style={{ border: "1px solid #EEEEEE" }}
              />
            </Col>
          ))}
        </Row>
      </Col>
    </Row>
  );
}
export default BountyMinting;