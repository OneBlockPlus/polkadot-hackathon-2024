import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

import TPL from "../system/tpl";

/* template series thumb list
*   @param  {string}    template         //template cid
*/

function ListSeries(props) {
  const size = {
    row: [12],
    grid: [3]
  };

  let [list, setList]=useState([]);

  useEffect(() => {
    TPL.view(props.template,(tpl)=>{
      console.log(tpl);
      if(!tpl) return false;
      setList(tpl.series);
    });
  }, [props.template]);

  return (
      <Row>
        {list.map((row, index) => (
        <Col key={index} md={size.grid[0]} lg={size.grid[0]} xl={size.grid[0]} xxl={size.grid[0]}>
          Series Image
        </Col>
        ))}
      </Row>
  );
}
export default ListSeries;