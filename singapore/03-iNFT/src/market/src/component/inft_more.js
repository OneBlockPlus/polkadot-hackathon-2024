import { Row, Col } from "react-bootstrap";
import { useEffect } from "react";
import { FaSlackHash, FaPizzaSlice, FaUserLock } from "react-icons/fa";

import QRCode from "react-qr-code";

import tools from "../lib/tools";


/* iNFT render component parameters
*   @param  {object}    data            //iNFT data
*   @param  {boolean}   [noPrice]       //wether show price
*   @param  {boolean}   [noBuy]        //wether show price
*   @param  {function}  link          //link convert function
*/

function MoreINFT(props) {
  const size = {
    row: [12],
    info: [2, 4],
    more: [1, 11],
  };

  useEffect(() => {
    //console.log(props.data);
  }, []);

  return (
    <Row className="pb-4">

      <Col className="pt-1 text-end" md={size.more[0]} lg={size.more[0]} xl={size.more[0]} xxl={size.more[0]}>
        <FaSlackHash />
      </Col>
      <Col className="pt-1" md={size.more[1]} lg={size.more[1]} xl={size.more[1]} xxl={size.more[1]}>
        
        {props.data && props.data.hash?tools.shorten(props.data.hash,20):""}
        {/* {props.data && props.data.hash?
          (<a href={`https://polkadot.js.org/apps/?rpc=wss://dev2.metanchor.net#/explorer/query/${props.data.hash}`} target="_blank" rel="noreferrer">
            {tools.shorten(props.data.hash,20)}
          </a>):""
        } */}
      </Col>

      <Col className="pt-1 text-end" md={size.more[0]} lg={size.more[0]} xl={size.more[0]} xxl={size.more[0]}>
        <FaUserLock />
      </Col>
      <Col className="pt-1" md={size.more[1]} lg={size.more[1]} xl={size.more[1]} xxl={size.more[1]}>
        {props.data && props.data.owner ? props.data.owner : ""}
      </Col>

      <Col className="pt-1 text-end" md={size.more[0]} lg={size.more[0]} xl={size.more[0]} xxl={size.more[0]}>
        <FaPizzaSlice />
      </Col>
      <Col className="pt-1" md={size.more[1]} lg={size.more[1]} xl={size.more[1]} xxl={size.more[1]}>
        {props.data && props.data.raw && props.data.raw.tpl ?
          (<span className="pointer" onClick={(ev) => { props.link("playground", [props.data.raw.tpl]) }}>
            {tools.shorten(props.data.raw.tpl, 20)}
          </span>) : ""
        }
      </Col>
      {/* <Col md={size.info[0]} lg={size.info[0]} xl={size.info[0]} xxl={size.info[0]}>
        <QRCode
          bgColor={"#ffffff"}
          fgColor={"#000000"}
          title={"QR title"}
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          value={"https://inft.w3os.net/market/view/xxx_122334"}
        />
      </Col> */}
    </Row>
  );
}
export default MoreINFT;