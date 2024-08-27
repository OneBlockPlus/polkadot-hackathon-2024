import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

import AccountAdd from "./account_add";
import AccountList from "./account_list";

function UserAccount(props) {
  const size = {
    row: [12],
    head:[7,5],
  };

  let [update, setUpdate]=useState(0);

  const self={
    fresh:()=>{
      setUpdate(update+1);
    },
  }

  useEffect(() => {
    //self.fresh();
  }, []);

  return (
    <Row>
      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <h5>iNFT Accounts Setting</h5>
        <small>Manage accounts for iNFT here. Attantion: please treate these account as hot wallet account.</small>
      </Col>

      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <hr />
      </Col>

      <Col md={size.head[0]} lg={size.head[0]} xl={size.head[0]} xxl={size.head[0]}>
        <h5>Account List</h5>
      </Col>
      <Col className="text-end" md={size.head[1]} lg={size.head[1]} xl={size.head[1]} xxl={size.head[1]}>
        <AccountAdd fresh={self.fresh} update={update} dialog={props.dialog}/>
      </Col>
      <Col className="pt-2" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <AccountList fresh={self.fresh} update={update} dialog={props.dialog}/>
      </Col>
    </Row>
  );
}
export default UserAccount;