import { Container, Row, Col, Button } from "react-bootstrap";

import { useState, useEffect } from "react";

import RUNTIME from "../lib/runtime";
import Copy from "../lib/clipboard";

function User(props) {
  let [amount, setAmount] = useState(0);
  let [avatar, setAvatar] = useState("user.png");
  let [info, setInfo] = useState("");
  let [disable, setDisable] = useState(false);
  let [clip, setClip] = useState("Copy");
  let [address, setAddress] = useState("");

  //const address="5CSTSUDaBdmET2n6ju9mmpEKwFVqaFtmB8YdB23GMYCJSgmw";

  const self = {
    remove: () => {
      //1.remove the account localstorage
      RUNTIME.removeAccount();

      //2.close the websocket
      const cfg = RUNTIME.getConfig("system");
      const uri=cfg.basic.talking[0];
      if(uri) RUNTIME.wsRemove(uri);

      props.fresh(); //父组件传过来的
    },
    charge: () => {
      setDisable("disabled");
      setInfo("Requesting...");
    },
    download: (ev) => {
      RUNTIME.getAccount((sign) => {
        //const address = sign.address;
        const pom = document.createElement("a");
        pom.setAttribute(
          "href",
          "data:text/plain;charset=utf-8," + JSON.stringify(sign),
        );
        pom.setAttribute("download", address + ".json");
        if (document.createEvent) {
          var event = document.createEvent("MouseEvents");
          event.initEvent("click", true, true);
          pom.dispatchEvent(event);
        } else {
          pom.click();
        }
      });
    },
    copyAddress: (ev) => {
      RUNTIME.getAccount((sign) => {
        Copy(sign.address);
        setDisable(true);
        setClip("Done");
        setTimeout(() => {
          setDisable(false);
          setClip("Copy");
        }, 1000);
      });
    },
  };

  const cls = {
    wordWrap: "break-word",
  };

  useEffect(() => {
    RUNTIME.getAccount((sign) => {
      if (!sign) return false;
      //console.log(sign);
      const address = sign.address;
      setAddress(address);
      props.balance(address, (res) => {
        if (res === false) {
          setAmount("unknown");
        } else {
          setAmount(parseFloat(res.free * 0.000000000001).toLocaleString());
        }
      });
      setAvatar(RUNTIME.getAvatar(address));
    });
  });

  const amap = {
    width: "60px",
    height: "60px",
    borderRadius: "30px",
    background: "#FFAABB",
  };

  return (
    <Container>
      <Row className="pt-2">
        <Col lg={2} xs={2} className="pt-2">
          <img style={amap} src={avatar} alt="user logo" />
        </Col>
        <Col lg={6} xs={6} className="pt-2">
          <h3>{""}</h3>
          <p>{amount} unit</p>
        </Col>
        <Col lg={4} xs={4} className="pt-4 text-end">
          <Button
            size="sm"
            variant="danger"
            onClick={(ev) => {
              self.remove(ev);
            }}
          >
            {" "}
            Remove{" "}
          </Button>{" "}
        </Col>
        <Col lg={12} xs={12} className="text-end">
          {info}
        </Col>

        <Col lg={9} xs={9} className="pt-2 text-start">
          <p className="text-justify" style={cls}>
            {address}
          </p>
        </Col>
        <Col lg={3} xs={3} className="text-end">
          <Button
            disabled={disable}
            className="mt-4"
            size="sm"
            variant="primary"
            onClick={(ev) => {
              self.copyAddress(ev);
            }}
          >
            {" "}
            {clip}{" "}
          </Button>
        </Col>

        {/* <Col lg={4} xs={4} className="pt-3 text-end" >
          <Button size="sm" variant="primary" onClick={self.charge} disabled={disable} > Free charge </Button>{' '}
        </Col> */}
        <Col lg={8} xs={8} className="pt-4 text-start">
          <p className="text-muted">Download your encry verify file.</p>
        </Col>
        <Col lg={4} xs={4} className="pt-4 text-end">
          <Button
            size="sm"
            variant="primary"
            onClick={(ev) => {
              self.download(ev);
            }}
          >
            {" "}
            Download{" "}
          </Button>{" "}
        </Col>
      </Row>
    </Container>
  );
}
export default User;
