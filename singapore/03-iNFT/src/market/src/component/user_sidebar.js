import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

import { FaHome,FaUserFriends,FaCat,FaBitcoin } from "react-icons/fa";

function UserSidebar(props) {
  const size = {
    row: [12],
  };

  let [list, setList] = useState([]);

  const self={
    getColor:(mod)=>{
      return props.active===mod?"#FFFFFF":"#666666"
    },
  }

  const menu = [
    {
      name: "basic",
      icon: <FaHome size={20}  className="mr-5" color={self.getColor("basic")}/>,
      title: "Basic",
      desc:"",
    },
    {
      name: "inft",
      icon: <FaCat size={20}  className="mr-5" color={self.getColor("inft")}/>,
      title: "My iNFTs",
    },
    {
      name: "bounty",
      icon: <FaBitcoin size={20}  className="mr-5" color={self.getColor("bounty")}/>,
      title: "Bounty",
      desc:"Manage your bounty",
    },
    {
      name: "account",
      icon: <FaUserFriends size={20}  className="mr-5" color={self.getColor("account")}/>,
      title: "Accounts",
      desc:"Manage your accounts",
    },
  ];

  useEffect(() => {
    setList(menu);
  }, [props.active]);

  return (
    <Row className="pt-4">
      <Col className="pb-2" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        User Setting
      </Col>
      {list.map((row, index) => (
        <Col key={index} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
          <button className={`sidebar text-start btn btn-md ${(props.active!==row.name?"btn-default":"btn-info")}`} onClick={(ev) => {
            props.link("user", [row.name]);
          }}><p>{row.icon}</p>  <h5>{row.title}</h5></button>
        </Col>
      ))}
    </Row>
  );
}
export default UserSidebar;