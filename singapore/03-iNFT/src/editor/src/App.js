import { Container,Col, Row } from "react-bootstrap";
import { useEffect, useState } from "react";

import Board from "./component/board";
//import Operation from "./component/operation";
import Basic from "./component/basic";
import Series from "./component/series";
import Template from "./component/template";
import Network from "./component/network";
import Preview from "./component/preview";
import Puzzle from "./component/puzzle";

import Multi from "./component/multi";

import NFT from "./component/nft";
import Detail from "./component/detail";
//import Solana from "./component/opt_solana";
//import AptOS from "./component/opt_aptos";

// import IPFS from "./lib/IPFS";
// import Solana_test from "./test/solana";
import AptOS_test from "./test/aptos";
//import IPFS_test from "./test/ipfs";

function App() {

  const size = {
    row: [12],
    side:[6,4,2],
    opt:[4,8],
  };

  let [update, setUpdate]= useState(0);

  const self={
    fresh:()=>{
      update++;
      setUpdate(update);
    },
  }
  
  useEffect(() => {
    //Solana_test.auto();
    //AptOS_test.auto();
    //IPFS_test.auto();
  }, []);

  return (
    <div>
      <Container>
        <Network fresh={self.fresh} update={update}/>
        <Row>
          <Col lg={size.side[0]} xl={size.side[0]} xxl={size.side[0]} >
            <Board fresh={self.fresh} update={update}/>
            <Row>
              <Col lg={size.opt[0]} xl={size.opt[0]} xxl={size.opt[0]} >
                <Basic fresh={self.fresh} update={update}/>
              </Col>
              <Col lg={size.opt[1]} xl={size.opt[1]} xxl={size.opt[1]} >
                {/* <Operation fresh={self.fresh} update={update}/> */}
                <Multi fresh={self.fresh} update={update}/>
                {/* <Solana fresh={self.fresh} update={update}/> */}
                {/* <AptOS fresh={self.fresh} update={update}/> */}
              </Col>
            </Row>
          </Col>
          <Col lg={size.side[1]} xl={size.side[1]} xxl={size.side[1]} >
            <NFT fresh={self.fresh} update={update}/>
            <Puzzle fresh={self.fresh} update={update}/>
            <Detail fresh={self.fresh} update={update} />
          </Col>
          <Col lg={size.side[2]} xl={size.side[2]} xxl={size.side[2]} > 
            
            <Template fresh={self.fresh} update={update}/>
            
            <Preview fresh={self.fresh} update={update}/>
            {/* <Basic fresh={self.fresh} update={update}/> */}
            <Series fresh={self.fresh} update={update}/>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
