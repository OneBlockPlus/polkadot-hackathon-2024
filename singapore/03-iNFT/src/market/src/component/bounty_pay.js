import { Row, Col } from "react-bootstrap";

import { useEffect, useState } from "react";

import Network from "../network/router";
import Config from "../system/config";
import API from "../system/api";
import tools from "../lib/tools";
import Bounty from "../system/bounty";

import { FaCheck } from "react-icons/fa";

/* iNFT render component parameters
*   @param  {string}    title           //button title
*   @param  {string}    network         //network to filter account
*   @param  {function}  [callback]      //callback function 
*/

function BountyPay(props) {
  const size = {
    row: [12],
    transaction: [1, 9, 2],
  };

  let [payed, setPayed] = useState(true);    //wether transfer and got hash
  let [info, setInfo] = useState("");

  //payment details from anchor raw data
  let [coin, setCoin] = useState("");
  let [network, setNetwork] = useState("");   //network of payment 
  let [amount, setAmount] = useState(0);       //amount of payment
  let [target, setTarget] = useState("");      //receiver address of payment

  let [title, setTitle] = useState(props.title);
  let [hash, setHash] = useState("");         //transaction hash to confirm payment;
  let [ready, setReady] = useState(false);

  const self = {
    changeHash: (ev) => {
      setHash(ev.target.value);
    },
    clickPayed: () => {
      setPayed(!payed);
      if (!payed) {
        setTitle(props.title);
      } else {
        setTitle("Update");
      }
    },
    clickSign: (ev) => {
      setInfo("");

      return props.callback({finalized:"0x5d7df76ab0a6f9548eb9eed45f8a9dac567250e0f415a38fa9de8041ac374ff2"},target,amount);

      if (!payed) {
        //1.here to update transaction hash directly.


      } else {
        //2.make the payment via Wallet
        const chain = Network(network);
        if (!chain) return props.callback && props.callback({ error: `Network ${network} payment is not support yet.` });
        //console.log(target, amount);

        const dapp = Config.get(["system", "name"]);
        chain.wallet(dapp,(injector,walletAddress)=>{
          //console.log(injector,walletAddress);
          //console.log(amount,target);
          chain.transfer(injector.signer,target,amount,(status)=>{
            //console.log(status);
            if(props.callback) props.callback(status,target,amount);
          },true,walletAddress);
        });
      }
    },
    decode: (alink) => {
      const str = alink.replace("anchor://", "");
      const arr = str.split("/");
      const block = parseInt(arr.pop());
      if (isNaN(block)) return false;
      return { name: arr.join("/"), block: block };
    },
    getBounty: (val, ck) => {
      const chain = Network("anchor");      //bounty data is base on Anchor Network
      chain.view(val, "anchor", (res) => {
        return ck && ck(res);
      });
    },
    getNetworkByCoin: (coin) => {
      const ns = Config.get("network");
      for (var k in ns) {
        if (ns[k].coin === coin && ns[k].enable) return k;
      }
      return false;
    },
    calcAmount: (bonus) => {
      let n = 0;
      for (let i = 0; i < bonus.length; i++) {
        const row = bonus[i];
        n += row.amount * row.bonus;
      }
      return n;
    },
    autoSet: (alink) => {
      const bounty = self.decode(alink);
      //1.get raw bounty data from anchor network
      if (bounty) {
        self.getBounty(bounty, (data) => {
          if (!data.raw || !data.raw.coin) return props.callback && props.callback({ error: "Invalid bounty anchor" });
          const coinName = data.raw.coin;
          const net = self.getNetworkByCoin(coinName.toUpperCase());
          setCoin(coinName);
          if (!net) return props.callback && props.callback({ error: "Network is not support yet." })
          setNetwork(net);

          const n = self.calcAmount(data.raw.bonus);
          setAmount(n);

          //2.get target account address from portal
          API.bounty.target(net, (res) => {
            if (!res.success) return props.callback && props.callback({ error: "Failed to get target address to pay." })
            setTarget(res.target);
            setReady(true);

            //3.check wether payed from local
            Bounty.get(alink,(local)=>{
              console.log(local);
              if(local.error){
                //FIXME, here to fresh local bounty information.
                return false;
              }
              if(local.payment) setReady(false);    //Payed, need to mute the pay function
            })
          });
        });
      }
    },
  }

  useEffect(() => {
    //console.log(props);
    if (props.bounty) self.autoSet(props.bounty);

  }, [props.bounty]);

  return (
    <Row>
      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        Total: <strong className="text-danger">{amount.toLocaleString()}</strong>
        <strong className="text-warning ml-5">${coin.toUpperCase()}</strong>. Target: <strong className="text-danger">{target}</strong>
      </Col>
      <Col className="pt-1" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <Row>
          <Col className="pt-1" md={size.transaction[0]} lg={size.transaction[0]} xl={size.transaction[0]} xxl={size.transaction[0]}>
            <button className={payed ? "btn btn-sm btn-default" : "btn btn-sm btn-primary"} onClick={(ev) => {
              self.clickPayed(ev)
            }}><FaCheck /></button>
          </Col>
          <Col hidden={payed} className="" md={size.transaction[1]} lg={size.transaction[1]} xl={size.transaction[1]} xxl={size.transaction[1]}>
            <input className="form-control" disabled={!ready} type="text" placeholder={`Transaction hash of ${tools.toUp(network)} network`} onChange={(ev) => {
              self.changeHash(ev);
            }} />
          </Col>
          <Col hidden={!payed} className="" md={size.transaction[1]} lg={size.transaction[1]} xl={size.transaction[1]} xxl={size.transaction[1]}>

          </Col>
          <Col className="text-end" md={size.transaction[2]} lg={size.transaction[2]} xl={size.transaction[2]} xxl={size.transaction[2]}>
            <button className="btn btn-md btn-primary" disabled={!ready} onClick={(ev) => {
              self.clickSign();
            }}>{title}</button>
          </Col>
          <Col className="text-end text-danger" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
            {info}
          </Col>
        </Row>
      </Col>
    </Row>
  );
}
export default BountyPay;