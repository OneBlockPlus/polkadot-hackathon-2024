import { Row, Col } from "react-bootstrap";
import { useEffect } from "react";

import tools from "../lib/tools";

/* iNFT render component parameters
*   @param  {object}    data            //iNFT data
*   @param  {boolean}   [noPrice]       //wether show price
*   @param  {boolean}   [noBuy]        //wether show price
*   @param  {function}  link          //link convert function
*/

function DetailINFT(props) {
  const size = {
    row: [12],
    info:[4,8],
    more:[1,11],
  };

  useEffect(() => {
    //console.log(props.data);
  }, []);

  return (
    <Row className="pb-4">
      <Col hidden={props.noPrice} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <small>Price</small>
        <h3 className="text-warning">{props.data && props.data.price?props.data.price:0}</h3>
      </Col>
      <Col className="pt-1" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <small>Name</small>
        <h3 className="text-warning">{props.data && props.data.name?props.data.name:""}</h3>
      </Col>

      <Col className="pt-1" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <small>Block</small>
        <h3 className="text-warning">{props.data && props.data.block?props.data.block.toLocaleString():0}</h3>
      </Col>

      <Col className="pt-1" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <small>Network</small>
        <h3 className="text-warning">{tools.toUp(props.data && props.data.network?props.data.network:"")}</h3>
      </Col>
    </Row>
  );
}
export default DetailINFT;