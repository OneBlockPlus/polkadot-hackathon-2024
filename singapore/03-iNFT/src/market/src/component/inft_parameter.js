import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

import TemplateValue from "./template_value";
import TemplateImage from "./template_image";
import TemplateCenter from "./template_center";
import TemplatePosition from "./template_position";
import TemplateRotation from "./template_rotation";

import { FaCode, FaAlignJustify } from "react-icons/fa";

function ParameterINFT(props) {

  const size = {
    row: [12],
    head: [10, 2]
  };

  let [code, setCode] = useState(false);

  const self = {
    switchCode: (ev) => {
      setCode(!code);
    },
  }

  useEffect(() => {
    //console.log(props.data);
  }, [props.data]);

  return (
    <Row className="pb-4">
      <Col className="pt-1" md={size.head[0]} lg={size.head[0]} xl={size.head[0]} xxl={size.head[0]}>
        <h5>iNFT part details</h5>
      </Col>
      <Col className="text-end pt-1" md={size.head[1]} lg={size.head[1]} xl={size.head[1]} xxl={size.head[1]}>
        <button className="btn btn-sm btn-secondary" onClick={(ev) => {
          self.switchCode(ev);
        }}>
          {!code ? <FaAlignJustify /> : <FaCode />}
        </button>
      </Col>
      <Col hidden={!code} className="pt-1" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <textarea className="form-control" value={JSON.stringify(props.data)} disabled></textarea>
      </Col>

      <Col hidden={code} className="pt-1" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <TemplateValue data={props.data.value}/>
        <TemplateImage data={props.data.img}/>
        <TemplateCenter data={props.data.center}/>
        <TemplatePosition data={props.data.position}/>
        <TemplateRotation data={props.data.rotation}/>
      </Col>
    </Row>
  );
}
export default ParameterINFT;