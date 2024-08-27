import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

import { FaBackspace,FaCopy } from "react-icons/fa";
import Account from "./account";
import Copy from "../lib/clipboard";
import tools from "../lib/tools";

function Seed(props) {
    const size = {
        row: [12],
        back: [10, 2],
        list:[4],
    };

    let [list, setList] = useState([]);
    let [recover, setRecover] = useState({});

    const self = {
        clickHome: () => {
            props.dialog(<Account fresh={props.fresh} dialog={props.dialog} />,"Account Management");
        },
        clickCopy: (mnemonic) => {
            Copy(mnemonic);
        },
        //the icon recover function
        clickRecover: (key, at) => {
            if (!recover[key]) {
                recover[key] = "text-info";
                setRecover(tools.copy(recover));
                setTimeout(() => {
                    delete recover[key];
                    setRecover(tools.copy(recover));
                }, !at ? 1000 : at);
            }
        },
        getArrayFromMnemonic: (str) => {
            return str.split(" ");
        }
    }

    useEffect(() => {
        //console.log(props.mnemonic);
        const nlist = self.getArrayFromMnemonic(props.mnemonic);
        setList(nlist);

    }, [props.update]);

    return (
        <Row>
            <Col className="pt-2" sm={size.back[0]} xs={size.back[0]}>
                Important, please copy 
                <button className="btn btn-sm btn-secondary" style={{ marginLeft: "10px" }} onClick={(ev) => {
                    self.clickCopy(props.mnemonic);
                    self.clickRecover("copy");
                }}><FaCopy className={!recover.copy ? "" : recover.copy} /></button>
            </Col>
            <Col className="pb-2 text-end" sm={size.back[1]} xs={size.back[1]}>
                <FaBackspace className="pointer" size={40} color={"#FFAABB"} onClick={(ev) => {
                    self.clickHome(ev);
                }} />
            </Col>
            <Col className="pt-2" sm={size.row[0]} xs={size.row[0]}>
                This is the only chance to record the <strong>SEED</strong> of your account.
            </Col>
            {list.map((row, index) => (
                <Col className="pt-2 text-center" key={index} sm={size.list[0]} xs={size.list[0]}>
                    <button className="btn btn-md btn-warning" style={{width:"100%"}}>
                        {row}
                    </button>
                </Col>
            ))}
            <Col className="pt-2" sm={size.row[0]} xs={size.row[0]}>
                This <strong>SEED</strong> is used to recover your account or create encried JSON files.
            </Col>
        </Row>
    )
}

export default Seed;