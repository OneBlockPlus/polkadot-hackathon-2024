import { Row, Col, Tabs, Tab } from "react-bootstrap";
import { useEffect, useState, useRef } from "react";

import BountyTarget from "./bounty_target";
import BountyTemplate from "./bounty_template";
import BountyDetail from "./bounty_detail";
import BountyPay from "./bounty_pay";
import BountyMore from "./bounty_more";

import Network from "../network/router";

import TPL from "../system/tpl";
import RUNTIME from "../system/runtime";
import Config from "../system/config";
import Bounty from "../system/bounty";
import API from "../system/api";

import tools from "../lib/tools";

function BountySubmit(props) {
  const size = {
    row: [12],
    half: [5],
    step: [2, 10],
    head: [4, 8],
    normal: [9, 3],
  };

  const loadRef = useRef(null);

  //submission details
  let [template, setTemplate] = useState("");
  let [bonus, setBonus] = useState([]);

  //step enable
  let [ready, setReady] = useState(false);
  //let [modify, setModify] = useState(true);       //wether modifable
  let [bounty, setBounty] = useState({});
  let [more, setMore] = useState({});

  let [enableLoad, setEnableLoad] = useState(true);
  let [enableSubmit, setEnableSubmit] = useState(false);
  //let [enablePay, setEnablePay] = useState(true);

  //UI improvement
  let [tabs, setTabs] = useState({
    "step_1": <span><strong className="text-secondary">Step 1 : </strong><strong>Template</strong></span>,
    "step_2": <span><strong className="text-secondary">Step 2 : </strong><strong className="text-secondary">Bonus</strong></span>,
    "step_3": <span><strong className="text-secondary">Step 3 : </strong><strong className="text-secondary">Payment</strong></span>,
  });

  //sub component params
  //let [series, setSeries] = useState([]);
  let [data, setData] = useState({});
  let [anchor, setAnchor] = useState("");     //alink of bounty

  let [info, setInfo] = useState("");         //writing status


  let [pay, setPay] = useState(false);
  let [payInfo, setPayInfo] = useState("");     //paying status

  const self = {
    changeTemplate: (ev) => {
      setTemplate(ev.target.value);
    },
    changeTabTitle: (active) => {
      const ts = {
        step_1: { index: 1, title: "Template" },
        step_2: { index: 2, title: "Bonus" },
        step_3: { index: 3, title: "Payment" },
      }

      const ntabs = {}
      for (var k in ts) {
        const row = ts[k];
        if (k === active) {
          ntabs[k] = <span><strong className="text-secondary">Step {row.index} : </strong><strong className="text-warning">{row.title}</strong></span>
        } else {
          ntabs[k] = <span><strong className="text-secondary">Step {row.index} : </strong><strong className="text-secondary">{row.title}</strong></span>
        }
      }
      setTabs(ntabs);
    },
    clickLoad: (ev) => {
      TPL.view(template, (dt) => {
        setData(dt);
        setReady(true);
        //setModify(false);
      });
    },
    clickSubmit: () => {
      const addr = RUNTIME.account.get();
      const name = Bounty.format.name("submit");

      //1.write data on chain
      const raw = Bounty.format.raw.submit(addr, more);
      const protocol = Bounty.format.protocol.submit();

      const dapp = Config.get(["system", "name"]);
      const obj = {
        anchor: name,
        raw: raw,
        protocol: protocol,
        dapp: dapp,
      }

      const chain = Network("anchor");
      chain.sign(obj, (res) => {
        setInfo(res.msg);

        if (res.status === "Finalized") {
          setTimeout(() => {
            setInfo("");
          }, 1500);
          const hash = res.hash;    //get the transaction hash

          chain.view({ name: name }, "anchor", (adata) => {
            //console.log(JSON.stringify(adata));

            if (!adata) return setInfo("Failed to get the bounty anchor data.");
            const alink = `anchor://${name}/${adata.block}`;

            const bt = Bounty.format.local(alink, addr, more);
            bt.status = Bounty.status("bounty", "LOCAL_SAVED");
            bt.publish.block = adata.block;
            bt.publish.hash = hash;

            //2.save the bounty data to local storage.
            Bounty.insert(bt, (dt) => {

              //3.report to iNFT manage system
              const detail = {
                bonus: bt.bonus,
                desc: bt.desc,
                publish: bt.publish,
                payer: bt.payer,
              }
              API.bounty.submit(alink, bt.coin, bt.start, bt.end, JSON.stringify(bt.template), JSON.stringify(detail), (res) => {
                if (!res || !res.success) return setInfo("Failed to submit to system");

                //4.update local status
                setAnchor(alink);
                Bounty.update.toReported(alink, () => {
                  props.dialog.close();
                  return true;
                });
              });
            });
          });
        }
      }, "subwallet");
    },
    callbackPay: (status, target, amount) => {
      if (status.error) return setPayInfo(status.error);
      if (!status.finalized) return setPayInfo(JSON.stringify(status));

      const dapp = Config.get(["system", "name"]);
      const name = Bounty.format.name("payment");
      const raw = Bounty.format.raw.payment(status.finalized, target, amount);
      const protocol = Bounty.format.protocol.payment(props.name);
      //console.log(name, raw, protocol);

      const obj = {
        anchor: name,
        raw: raw,
        protocol: protocol,
        dapp: dapp,
      }

      //1.write payment information on chain
      const chain = Network("anchor");
      chain.sign(obj, (res) => {
        if (res.status !== "Finalized") return setPayInfo(res.msg);

        chain.view({ name: name }, "anchor", (dt) => {
          const alink = `anchor://${name}/${dt.block}`;
          //2.update local record status
          Bounty.update.toPayed(props.name, alink, () => {
            //3.submit the payment details to portal system 
            API.bounty.payment(props.name, alink, (rows) => {

            });
          });
        });
      });
    },
    callbackBonus: (list) => {
      const arr = [];
      for (let i = 0; i < list.length; i++) {
        const row = list[i];
        delete row.thumb;
        delete row.name;
        arr.push(row);
      }
      setBonus(arr);
    },
    callbackMore: (more) => {
      more.template = template;
      more.bonus = bonus;
      setMore(tools.clone(more));
    },
    load: (bt) => {
      setTemplate(bt.template.cid);
      setTimeout(() => {
        loadRef.current.click();
        setEnableLoad(false);
      }, 200);

      if (bt.bonus) setBonus(bt.bonus);
    },
  }

  useEffect(() => {
    self.changeTabTitle("step_2");
    if (props.name) {
      setAnchor(props.name);
      Bounty.get(props.name, (bty) => {
        //if (!res || res.length === 0) return false;
        if(bty.error) return false;
        //const bty = res[0];
        self.load(bty);
        setBounty(bty);
        //setModify(false);
      });
    } else {
      setEnableSubmit(true);
    }
  }, [props.name]);

  return (
    <Tabs
      defaultActiveKey="step_1"
      id="uncontrolled-tab-example"
      className="mb-3"
      fill
      onSelect={(active) => {
        self.changeTabTitle(active);
      }}
    >
      <Tab eventKey="step_1" title={tabs.step_1}>
        <Row>
          <Col className="text-info" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
            Select a template for bounty which is storage on IPFS.
          </Col>

          <Col className="pt-2" md={size.normal[0]} lg={size.normal[0]} xl={size.normal[0]} xxl={size.normal[0]}>
            <input type="text" disabled={!enableLoad} className="form-control" placeholder="Input template CID"
              value={template} onChange={(ev) => {
                self.changeTemplate(ev);
              }} />
          </Col>
          <Col className="pt-2 text-end" md={size.normal[1]} lg={size.normal[1]} xl={size.normal[1]} xxl={size.normal[1]}>
            <button disabled={!enableLoad} className="btn btn-md btn-primary" ref={loadRef} onClick={(ev) => {
              self.clickLoad(ev);
            }}>Load</button>
          </Col>
          <Col hidden={!ready} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
            <BountyTemplate data={data} />
          </Col>
        </Row>
      </Tab>
      <Tab eventKey="step_2" title={tabs.step_2}>
        <Row>
          <Col hidden={!ready} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
            <Row>
              <Col className="text-info" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
                Setup the details about the bounty and write on chain.
              </Col>
              <Col className="" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
                <BountyMore bounty={bounty} callback={(more) => {
                  self.callbackMore(more);
                }} />
              </Col>
              <Col className="" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
                <BountyTarget data={data} link={anchor} callback={(dt) => {
                  self.callbackBonus(dt);
                }} />
              </Col>
              <Col className="" md={size.normal[0]} lg={size.normal[0]} xl={size.normal[0]} xxl={size.normal[0]}>
                {info}
              </Col>
              <Col className="text-end" md={size.normal[1]} lg={size.normal[1]} xl={size.normal[1]} xxl={size.normal[1]}>
                <button disabled={!enableSubmit} className="btn btn-md btn-primary" onClick={(ev) => {
                  self.clickSubmit();
                }}>Submit</button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Tab>
      <Tab eventKey="step_3" title={tabs.step_3}>
        <Row>
          <Col hidden={pay} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
            <Row>
              <Col className="text-info" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
                Payment details.
              </Col>
              <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
                <BountyDetail link={anchor} data={data} />
              </Col>
              <BountyPay title={"Pay Now"} bounty={anchor} callback={(status, target, total) => {
                self.callbackPay(status, target, total);
              }} />
              <Col className="text-end" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
                {payInfo}
              </Col>
            </Row>
          </Col>
        </Row>
      </Tab>
    </Tabs>
  );
}
export default BountySubmit;