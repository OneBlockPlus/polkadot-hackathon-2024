import { Row, Col } from "react-bootstrap";
import { useEffect } from "react";
import { FaList,FaRegUser,FaRegImage,FaPizzaSlice } from "react-icons/fa";

import Account from "./account";
import Template from "./template";
import Mine from "./mine";

function Header(props) {
    const size = {
        row: [12],
        title:[2,7,3]
    };

    const dialog=props.dialog;

    const self={
        clickMine:(ev)=>{
            dialog(<Mine fresh={props.fresh} dialog={props.dialog} />,"My iNFT List");
        },
        clickTemplate:(ev)=>{
            dialog(<Template fresh={props.fresh} dialog={props.dialog} />,"Template");
        },
        clickAccount:(ev)=>{
            dialog(<Account fresh={props.fresh} dialog={props.dialog} />,"Account Management");
        },

    }
    useEffect(() => {
       
    }, [props.update]);

    return (
        <Row className="pt-4">
            <Col sm={size.title[0]} xs={size.title[0]}>
                <FaList className="pointer" size={26} onClick={(ev)=>{
                    self.clickMine(ev);
                }}/>
            </Col>
            <Col sm={size.title[1]} xs={size.title[1]}>
               <h3>iNFT Minter</h3> 
            </Col>
            <Col className="text-end" sm={size.title[2]} xs={size.title[2]}>
                <FaPizzaSlice className="pointer" size={26} onClick={(ev)=>{
                    self.clickTemplate(ev);
                }}/>
                <FaRegUser className="pointer" size={26} style={{marginLeft:"15px"}} onClick={(ev)=>{
                    self.clickAccount(ev);
                }}/>
            </Col>
        </Row>
    )
}

export default Header;