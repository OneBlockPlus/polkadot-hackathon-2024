import { Row, Col } from "react-bootstrap";
import { useState,useEffect } from "react";

import StorageTemplat from "./storage_template";
import StorageINFT from "./storage_inft";

import INDEXED from "../lib/indexed";
import Config from "../system/config";

function SettingStorage(props) {
  const size = {
    row: [12],
    head: [4, 8],
  };

  let [update, setUpdate] =useState(0);

  const nameDB=Config.get(["storage","DBname"]);  
  const self={
    clickCleanTemplate:()=>{
      const table="template";
      INDEXED.checkDB(nameDB, (db) => {
        INDEXED.deleteTable(db, table, () => {
          self.update();
        });
      });
    },
    clickCleanINFT:()=>{
      const table="infts";
      INDEXED.checkDB(nameDB, (db) => {
        INDEXED.deleteTable(db, table, () => {
          self.update();
        });
      });
    },
    update:()=>{
      setUpdate(update+1);
    },
  }

  useEffect(() => {

  }, []);

  return (
    <Row>
      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <h5>iNFT Local Storage Setting</h5>
      </Col>

      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <hr />
      </Col>

      <Col md={size.head[0]} lg={size.head[0]} xl={size.head[0]} xxl={size.head[0]}>
        Template List
      </Col>
      <Col className="text-end" md={size.head[1]} lg={size.head[1]} xl={size.head[1]} xxl={size.head[1]}>
        <button className="btn btn-sm btn-danger" onClick={(ev)=>{
          self.clickCleanTemplate();
        }}>Clean Template Cache</button>
      </Col>
      <Col className="pt-2" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <StorageTemplat update={update}/>
      </Col>

      <Col className="pt-4" md={size.head[0]} lg={size.head[0]} xl={size.head[0]} xxl={size.head[0]}>
        iNFT Cache List
      </Col>
      <Col className="pt-4 text-end" md={size.head[1]} lg={size.head[1]} xl={size.head[1]} xxl={size.head[1]}>
        <button className="btn btn-sm btn-danger" onClick={(ev)=>{
          self.clickCleanINFT();
        }}>Clean All iNFT Cache</button>
      </Col>
      <Col className="pt-2" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <StorageINFT update={update}/>
      </Col>
    </Row>
  );
}
export default SettingStorage;