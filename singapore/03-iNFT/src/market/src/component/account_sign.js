import { Row, Col } from "react-bootstrap";

import { useEffect, useState } from "react";

import AccountSelector from "./account_selector";

import Network from "../network/router";
import Account from "../system/account";
import Config from "../system/config";

import { FaCheck } from "react-icons/fa";

/* iNFT render component parameters
*   @param  {string}    title           //button title
*   @param  {string}    network         //network to filter account
*   @param  {function}  [callback]      //callback function 
*/

function AccountSign(props) {
  const size = {
    row: [12],
    //buy: [1,5,4,2],
    buy: [2,10,12,12],
    grid:[9,3],
    more:[5,4],
  };

  let [wallet, setWallet] = useState(true);
  let [info, setInfo] = useState("");
  let [address, setAddress]= useState("");
  let [balance,setBalance] = useState(0);
  let [password, setPassword] = useState("");

  const chain=Network(props.network);

  const self = {
    changeAccount:(addr)=>{
      setInfo("");
      chain.balance(addr,(res)=>{
        const val=parseFloat(res.free/chain.divide());
        setBalance(val);
        //setInfo(`Balance: ${val} $ANK`);
      });
      setAddress(addr);
    },
    changePassword:(ev)=>{
      setPassword(ev.target.value);
    },
    clickWallet:()=>{
      setWallet(!wallet);
    },
    clickSign:(ev)=>{
      setInfo("");
      if(!wallet){
        self.getPair((pair)=>{
          setPassword("");
          if(pair!==false && props.callback) props.callback({wallet:wallet,signer:pair});
        });
      }else{
        const dapp = Config.get(["system", "name"]);
        chain.wallet(dapp,(injector,addr)=>{
          if(injector.error) return setInfo(injector.error);
          if(props.callback) props.callback({wallet:wallet,signer:injector.signer,address:addr});
        });
      }
    },
    getPair:(ck)=>{
      Account.get(address,(res)=>{
        if(!res || res.length===0){
          setInfo("No such account");
          return ck && ck(false);
        }

        const fa=JSON.stringify(res[0]);
        chain.load(fa, password, (pair)=>{
          if(pair.error){
            setInfo(pair.error);
            return ck && ck(false);
          }
          return ck && ck(pair);
        });
      });
    },
  }

  useEffect(() => {

  }, [props.network]);

  return (
    <Row>
      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <hr />
      </Col>
      <Col className="pt-2 pb-1 text-end" hidden={!wallet} md={size.grid[0]} lg={size.grid[0]} xl={size.grid[0]} xxl={size.grid[0]}>
        <span>Select accounts to buy.</span>
      </Col>
      <Col hidden={wallet} className="pt-2" md={size.grid[0]} lg={size.grid[0]} xl={size.grid[0]} xxl={size.grid[0]}>
        <AccountSelector network={"anchor"} callback={(addr) => {
            self.changeAccount(addr);
          }} />
        {/* <small>Balance: {balance}</small> */}
      </Col>
      <Col className="pt-2 pb-2 text-end" md={size.grid[1]} lg={size.grid[1]} xl={size.grid[1]} xxl={size.grid[1]}>
        <button className={wallet ? "btn btn-sm btn-default" : "btn btn-sm btn-primary"} onClick={(ev) => {
          self.clickWallet(ev)
        }}><FaCheck /></button>
        {/* <span className="ml-10">{balance} $ANK</span>   */}
      </Col>
      <Col hidden={!wallet} className="pt-2" md={size.grid[0]} lg={size.grid[0]} xl={size.grid[0]} xxl={size.grid[0]}>
      
      </Col>
      <Col hidden={wallet} className="pt-2" md={size.more[0]} lg={size.more[0]} xl={size.more[0]} xxl={size.more[0]}>
        <input type="password" className="form-control" placeholder="password for account" value={password} onChange={(ev)=>{
          self.changePassword(ev);
        }}/>
      </Col>
      <Col hidden={wallet} className="pt-2 text-end" md={size.more[1]} lg={size.more[1]} xl={size.more[1]} xxl={size.more[1]}>
          <p className="pt-2">{balance}</p>
      </Col>
      <Col className="pt-2 text-end" md={size.grid[1]} lg={size.grid[1]} xl={size.grid[1]} xxl={size.grid[1]}>
        <button className="btn btn-md btn-primary" onClick={(ev)=>{
          self.clickSign();
        }}>{props.title}</button>
      </Col>
      <Col className="text-end text-danger" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        {info}
      </Col>
    </Row>
  );
}
export default AccountSign;