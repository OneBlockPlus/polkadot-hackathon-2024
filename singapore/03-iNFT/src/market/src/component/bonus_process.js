import { Row, Col, Image } from "react-bootstrap";
import { useEffect, useState } from "react";

import BountyApply from "./bounty_apply";

import Config from "../system/config";
import Account from "../system/account";
import API from "../system/api";
import Network from "../network/router";

import tools from "../lib/tools";

function BonusProcess(props) {
  const size = {
    row: [12],
    head: [4, 8],
    half: [6],
    apply: [3,9],
    winner:[3],
    divert:[9,3],
  };

  let [list, setList] = useState([]);
  let [winners,setWinners] = useState([]);

  let [password, setPassword] = useState({});

  const self = {
    clickApply: () => {
      props.dialog.close();
      setTimeout(() => {
        props.dialog.show(<BountyApply data={props.data} index={props.index} dialog={props.dialog} />, "Bounty Apply");
      }, 200);
    },
    clickDivert:(name,addr,index)=>{
      console.log(name,addr,index);
      //console.log(props,name,addr,password);
      const chain=Network("anchor");
      const ak=self.decode(props.data.alink);
      //console.log(ak);
      chain.view(ak,"anchor",(dt)=>{
        //FIXME, need to get the consignee from bounty raw data
        const target="5DLgD2J6R7QRo8CuZRnT7ZiYmwUTLz2jmhUPc1Jd44LLrd9X";
        Account.get(addr,(file)=>{
          try {
            chain.load(JSON.stringify(file[0]), password[name], (pair) => {
              chain.divert(pair,name,target,(res)=>{
                console.log(res);
                if(res.status==="Finalized"){
                  API.bounty.divert(props.data.alink,index,res.hash,(final)=>{
                    console.log(final);
                  });
                }
              });
            });
          }catch (error) {
            
          }
        });
      });
    },
    changePassword:(ev,name)=>{
      password[name]=ev.target.value;
      setPassword(tools.clone(password));
    },
    decode:(alink)=>{
      const str=alink.replace("anchor://","");
      const arr=str.split("/");
      const block=parseInt(arr.pop());
      if(isNaN(block)) return false;
      return {name:arr.join("/"),block:block};
    },
    getTarget: () => {
      if (props.data.detail && props.data.detail.bonus) {
        const bs = props.data.detail.bonus;
        const target = bs[props.index];
        const ss = props.template.series;
        const series = ss[target.series];
        return series.thumb[0];
      }
      return `${window.location.origin}/imgs/logo.png`;
    },
    getCreateStamp:(stamp)=>{
      const dd=new Date(stamp);
      return dd.toLocaleDateString();
    },
    getApplyStatus: (judge) => {
      if (judge === null) return "Pending";
      return judge.raw.result ? "Acceptted" : "Refused"
    },
    getAvatar: (addr) => {
      const cfg = Config.get(["system", "avatar"]);
      return `${cfg.base}/${addr}.png${cfg.set}`;
    },

    applyList: (aps, index) => {
      //1.filter out the bonus submissions
      const arr = [];
      for (let i = 0; i < aps.length; i++) {
        const row = aps[i];
        const atom = { inft: null, judge: null, distribute: null,divert:"",index:i }
        if (row.record && row.record.raw && row.record.raw.bounty && row.record.raw.bounty.bonus === index) {
          atom.inft = row.link;
          atom.record=row.record;
          if (row.judge && row.judge.raw) {
            atom.judge = row.judge;
          }

          if (row.distribute && row.distribute.raw) {
            atom.distribute = row.distribute;
          }

          if(row.divert) atom.divert=row.divert

          arr.push(atom);
        }
      }
      console.log(arr);
      setList(arr.reverse());

      //2.filter out the winners;
      const nlist=[];
      for (let i = 0; i < arr.length; i++) {
        const row=arr[i];
        //console.log(row);
        if(row.judge!==null && row.judge.raw && row.judge.raw.result){
          nlist.push({
            address:row.record.raw.receiver.address,
          });
        }
      }
      setWinners(nlist);
    },
    hiddenPassword:(row)=>{
      if(!Account.exsist(row.inft.owner)) return true;
      if(row.divert!=="") return true;
      return false;
    },
    disableDivert:(row)=>{

    },
  }

  useEffect(() => {
    Account.map((res)=>{
      console.log(props.data.apply);
      self.applyList(props.data.apply, props.index);
    });
  }, [props.index]);

  return (
    <Row>
      <Col md={size.head[0]} lg={size.head[0]} xl={size.head[0]} xxl={size.head[0]} >
        <h5>Wanted</h5>
        <img src={self.getTarget()} className="apply_thumb" alt="" />
        <span>Create on {self.getCreateStamp(parseInt(props.data.ctime)*1000)}</span>
      </Col>
      <Col md={size.head[1]} lg={size.head[1]} xl={size.head[1]} xxl={size.head[1]} >
        <Row>
          <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
            <strong>{props.data.detail.desc}</strong>
          </Col>
          <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
            Bonus #{props.index}: template series {props.data.detail.bonus[props.index].series}
          </Col>
          <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
            Progress: {props.data.detail.bonus[props.index].amount} wanted, {list.length} submission
          </Col>
          <Col className="text-end" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
            <button className="btn btn-md btn-primary" onClick={(ev) => {
              self.clickApply();
            }}>Apply</button>
          </Col>
          <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
            Winners
          </Col>
          <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
            <Row>
            {winners.map((row, index) => (
              <Col key={index} className="text-center"  md={size.winner[0]} lg={size.winner[0]} xl={size.winner[0]} xxl={size.winner[0]} >
                
                <Image
                  src={self.getAvatar(row.address)}
                  rounded
                  width="100%"
                  style={{ minHeight: "80px" }}
                />
                {tools.shorten(row.address,4)}
              </Col>
            ))}
            </Row>
          </Col>
        </Row>
      </Col>
      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
        <hr />
      </Col>
      <Col md={size.head[0]} lg={size.head[0]} xl={size.head[0]} xxl={size.head[0]} >
        <h5>Submission</h5>
      </Col>
      <Col className="text-end" md={size.head[1]} lg={size.head[1]} xl={size.head[1]} xxl={size.head[1]} >
        Total {list.length} iNFTs
      </Col>
      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
        <Row className="container_apply">
          {list.map((row, index) => (
            <Col className="pt-2" key={index} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
              <Row>
                <Col md={size.apply[0]} lg={size.apply[0]} xl={size.apply[0]} xxl={size.apply[0]} >
                  <img src={row.inft.bs64} className="apply_thumb" alt="" />

                </Col>
                <Col md={size.apply[1]} lg={size.apply[1]} xl={size.apply[1]} xxl={size.apply[1]} >
                  <Row>
                    <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                      <p><strong>anchor://{row.inft.name}/{row.inft.block}</strong>, owner:<strong>{tools.shorten(row.inft.owner)}</strong></p>
                      {self.getApplyStatus(row.judge)}
                    </Col>
                    <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                      {row.distribute !== null ? "Payed" : "Waiting for distributition"}
                    </Col>
                    <Col className="text-end pt-1" md={size.divert[0]} lg={size.divert[0]} xl={size.divert[0]} xxl={size.divert[0]} >
                      <input type="password" hidden={self.hiddenPassword(row)}  className="form-control" 
                        placeholder={`Password of ${tools.shorten(row.inft.owner)}`} onChange={(ev)=>{
                          self.changePassword(ev,row.inft.name);
                        }}/>
                    </Col>
                    <Col className="text-end pt-1" md={size.divert[1]} lg={size.divert[1]} xl={size.divert[1]} xxl={size.divert[1]} >
                      <button 
                        disabled={self.hiddenPassword(row)}
                        className={!self.hiddenPassword(row)?"btn btn-md btn-primary":"btn btn-sm btn-default"} 
                        onClick={(ev)=>{
                          self.clickDivert(row.inft.name,row.inft.owner,row.index);
                        }}>Divert</button>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
          ))}
        </Row>
      </Col>
      <Col className="pt-4" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
        Bounty start from {props.data.start && parseInt(props.data.start).toLocaleString()} to {props.data.end && parseInt(props.data.end).toLocaleString()}
      </Col>
    </Row>
  );
}
export default BonusProcess;