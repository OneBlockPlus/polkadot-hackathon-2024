import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

import ParameterINFT from "./inft_parameter";
import tools from "../lib/tools";

/* iNFT parts preview
*   @param  {array}     data          //parts array
*   @param  {function}  [callback]    //selected change callback
*/

function PartsINFT(props) {
  const size = {
    row: [12],
    grid: [2],
    parts:[10,2]
  };

  let [cur, setCurrent] = useState(props.selected===undefined?0:parseInt(props.selected));

  let [parts, setParts] = useState([]);
  let [value, setValue] = useState({});

  const self={
    clickPart:(index)=>{
      const target=parts[index];
      setValue(tools.copy(target));
      setCurrent(index);
      if(props.callback) props.callback(index);
    },  
  }

  useEffect(() => {
    setCurrent(props.selected);
    setParts(props.data);
    if(props.data && props.data[cur]){
      setValue(tools.copy(props.data[cur]));
    } 
  }, [props.data,props.selected]);

  return (
    <Row className="pt-2">
      <Col md={size.parts[0]} lg={size.parts[0]} xl={size.parts[0]} xxl={size.parts[0]} >
        <ParameterINFT data={value} />
      </Col>
      <Col md={size.parts[1]} lg={size.parts[1]} xl={size.parts[1]} xxl={size.parts[1]} >
        <Row className="pb-2 text-center">
          {parts.map((row, index) => (
            <Col className="text-end pt-1" key={index} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
              <button className={index===cur?"parts btn btn-md btn-warning":"parts btn btn-md btn-secondary"} onClick={(ev)=>{
                self.clickPart(index)
              }}>#{index+1}</button>
            </Col>
          ))}
        </Row>
      </Col>
    </Row>

  );
}
export default PartsINFT;