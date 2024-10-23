import { Row, Col, Image, Badge } from "react-bootstrap";
import { useEffect, useState } from "react";

import Network from "../network/router";

import Account from "../system/account";
import Config from "../system/config";
import tools from "../lib/tools";

function AccountGenerate(props) {
  const size = {
    row: [12],
    generate:[3,5,4],
    left:[4,8],
    right:[8,4],
    grid:[3],
  };


  let [networks, setNetworks] = useState([]);
  let [current, setCurrent] = useState("");
  
  let [info,setInfo] = useState("");
  let [password, setPassword]  = useState("");

  let [accountFile,setAccountFile] = useState({});
  let [words, setWords]= useState([]);
  let [thumb, setThumb]= useState("");

  let [saveInfo, setSaveInfo] = useState("Set the password to save account to local cache.");

  const self = {
    changeNetwork: (ev) => {
      setCurrent(ev.target.value);
      
    },
    changePassword:(ev)=>{
      setPassword(ev.target.value);
      if(!ev.target.value){
        setSaveInfo("Set the password to save account to local cache.");
      }else{
        setSaveInfo("");
      }
    },
    clickGenerate:(ev)=>{
      console.log(current,password);
      const chain=Network(current);
      if(chain.generate)chain.generate(password,(pair,mnemonic)=>{
        console.log(pair,mnemonic);
        setAccountFile(pair);
        setWords(mnemonic.split(" "));
        setThumb(self.getAvatar(pair.address));
        if(password) setSaveInfo("")
      });
    },
    getAvatar: (addr) => {
      const cfg = Config.get(["system", "avatar"]);
      return `${cfg.base}/${addr}.png${cfg.set}`;
    },
    getNetworks: (ck) => {
      if (networks.length !== 0) return ck && ck(networks);
      const ns = Config.get("network");
      for (var k in ns) {
        const row = ns[k];
        if (row.enable && row.support && row.support.minting) {
          row.name = k;
          networks.push(row);
        }
      }
      return ck && ck(tools.clone(networks));
    },
    fresh: () => {
      self.getNetworks((ns) => {
        setCurrent(ns[0].name);
        setNetworks(ns);
      });
    },
  }

  useEffect(() => {
    self.fresh();
  }, []);

  return (
    <Row>
      <Col md={size.generate[0]} lg={size.generate[0]} xl={size.generate[0]} xxl={size.generate[0]}>
        <select className="form-control" onChange={(ev) => {
          self.changeNetwork(ev);
        }} value={current}>
          {networks.map((row, index) => (
            <option key={index} value={row.name}>{tools.toUp(row.name)} Network</option>
          ))}
        </select>
      </Col>
      <Col md={size.generate[1]} lg={size.generate[1]} xl={size.generate[1]} xxl={size.generate[1]}>
        <input className="form-control" type="password" value={password} 
          placeholder="Password for account"
          onChange={(ev)=>{
            self.changePassword(ev);
          }}/>
      </Col>
      <Col className="text-end" md={size.generate[2]} lg={size.generate[2]} xl={size.generate[2]} xxl={size.generate[2]}>
          <button className="btn btn-md btn-primary" onClick={(ev)=>{
            self.clickGenerate(ev);
          }}>Generate</button>
      </Col>
      <Col className="text-end" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        {info}
      </Col>
      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <hr />
      </Col>
      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <Row>
          <Col md={size.left[0]} lg={size.left[0]} xl={size.left[0]} xxl={size.left[0]}>
          <Image
            src={thumb}
            rounded
            width="100%"
            style={{ minHeight: "80px" }}
          />
           
          </Col>
          <Col md={size.left[1]} lg={size.left[1]} xl={size.left[1]} xxl={size.left[1]}>
            <Row>
            <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
              <Badge className="bg-danger">Warning</Badge>
              <span className="ml-5">These words is used to generate the account.</span> 
            </Col>
            {words.map((row, index) => (
               <Col className="text-center pt-2" md={size.grid[0]} lg={size.grid[0]} xl={size.grid[0]} xxl={size.grid[0]}>
                  <button className="btn btn-md btn-info" style={{width:"100px"}} key={index}>{row}</button>
               </Col>
            ))}
            </Row>
          </Col>
        </Row>
      </Col>
      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        Address : {!accountFile.address?"":accountFile.address}        
      </Col>
      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <hr />
      </Col>
      <Col md={size.right[0]} lg={size.right[0]} xl={size.right[0]} xxl={size.right[0]}>
          {saveInfo}
      </Col>
      <Col className="text-end" md={size.right[1]} lg={size.right[1]} xl={size.right[1]} xxl={size.right[1]}>
        <button disabled={!password || !accountFile.address} className="btn btn-md btn-primary">Save Account</button>
      </Col>
    </Row>
  );
}
export default AccountGenerate;