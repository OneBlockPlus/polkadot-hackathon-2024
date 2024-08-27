import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

import Network from "../network/router";
import Account from "../system/account";
import tools from "../lib/tools";

function AccountLoad(props) {
  const size = {
    row: [12],
    half:[6],
    footer:[9,3],
  };

  let [file, setFile]=useState("");
  let [password,setPassword]=useState("");
  let [info, setInfo]=useState("");

  const self={
    changeFile:(ev)=>{
      try {
        const fa = ev.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            
            try {
                const sign = JSON.parse(e.target.result);
                if (!sign.address || !sign.encoded)
                    return setInfo("Error encry JSON file");
                if (sign.address.length !== 48)
                    return setInfo("Error SS58 address");
                if (sign.encoded.length !== 268)
                    return setInfo("Error encoded verification");

                setFile(e.target.result);
                setInfo(`Load "${tools.shorten(sign.address)}" json file.`);
            } catch (error) {
                setInfo("Not encry JSON file");
            }
        };
        reader.readAsText(fa);
    } catch (error) {
        setInfo("Can not load target file");
    }
    },
    changePassword:(ev)=>{
      setPassword(ev.target.value);
    },
    clickLoad:()=>{
      setInfo("");
      const chain=Network(props.network);
      try {
        
        chain.load(file, password, (pair) => {
          if(pair.error){
            return setInfo(pair.error);
          }

          const sign = JSON.parse(file);
          sign.network=props.network;
          Account.import(password,sign,()=>{

          });
        });
      } catch (error) {
        
      }
    },
  }

  useEffect(() => {
    console.log(props);
  }, []);

  return (
    <Row>
      <Col md={size.half[0]} lg={size.half[0]} xl={size.half[0]} xxl={size.half[0]}>
        <small>Select the encried account json file.</small>
        <input className="form-control" type="file" onChange={(ev)=>{
          self.changeFile(ev);
        }} />
      </Col>
      <Col md={size.half[0]} lg={size.half[0]} xl={size.half[0]} xxl={size.half[0]}>
        <small>Password of the account file.</small>
        <input className="form-control" type="password" onChange={(ev)=>{
          self.changePassword(ev);
        }} />
      </Col>
      <Col hidden={!file} className="pt-4" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <textarea className="form-control" disabled  cols={30} value={file}></textarea>
      </Col>
      <Col className="pt-4" md={size.footer[0]} lg={size.footer[0]} xl={size.footer[0]} xxl={size.footer[0]}>
        {info}
      </Col>
      <Col className="pt-4 text-end" md={size.footer[1]} lg={size.footer[1]} xl={size.footer[1]} xxl={size.footer[1]}>
        <button className="btn btn-md btn-primary" onClick={(ev)=>{
          self.clickLoad();
        }}>Load</button>
      </Col>
    </Row>
  );
}
export default AccountLoad;