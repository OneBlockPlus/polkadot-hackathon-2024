import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

import UserBasic from "../component/user_basic";
import UserSidebar from "../component/user_sidebar";
import UserINFT from "../component/user_inft";
import UserAccount from "../component/user_account";
import UserBounty from "../component/user_bounty";
import User404 from "../component/user_404";

function User(props) {
    const size = {
        sidebar: [2, 10],
    };

    const map={
        "basic":<UserBasic dialog={props.dialog}/>,
        "inft":<UserINFT  dialog={props.dialog} link={props.link}/>,
        "account":<UserAccount dialog={props.dialog}/>,
        "bounty":<UserBounty dialog={props.dialog}/>,
        "404":<User404 />,
    }

    let [ active, setActive ]= useState("basic");
    let [ content, setContent] =useState("");

    useEffect(() => {
        //console.log(props);
        if(props.extend && props.extend.mod){
            const mod=props.extend.mod;
            if(mod!==active){
                setActive(mod);
                if(map[mod]){
                    setContent(map[mod]);
                }else{
                    setContent(map["404"]);
                }
            }
        }else{
            setContent(map[active]);
        }
    }, [props.extend]);
    
    return (
        <Row className="pt-2">
            <Col md={size.sidebar[0]} lg={size.sidebar[0]} xl={size.sidebar[0]} xxl={size.sidebar[0]} >
                <UserSidebar link={props.link} active={active}/>
            </Col>
            <Col md={size.sidebar[1]} lg={size.sidebar[1]} xl={size.sidebar[1]} xxl={size.sidebar[1]} >
                {content}
            </Col>
        </Row>
    )
}

export default User;