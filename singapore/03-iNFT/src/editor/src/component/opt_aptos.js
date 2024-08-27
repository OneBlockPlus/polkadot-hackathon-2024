import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

import APT from "../network/aptos";
import {Network} from "@aptos-labs/ts-sdk";

function AptOS(props) {
    const size = {
        row: [12],
    };

    const self={
        clickView:(ev)=>{
            const hash="0xab61910eb5eecc335bca4512ab3fc0d8b84cef3743f0a55c8b0a86e52375384b";
            //const type="account";
            const type="transaction";
            APT.view(hash,type,(res)=>{
                console.log(JSON.stringify(res));
            },Network.DEVNET);
        },
    };

    useEffect(() => {
        APT.generate();
        
    }, [props.update]);

    return (
        <Row className="pt-2">
            <Col lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                Check Aptos information here to confirm the operation of storage validly.
            </Col>
            <Col className="text-end pt-2" lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                <button className="btn btn-md btn-primary" onClick={(ev)=>{
                    self.clickView(ev);
                }}>Wallet</button>
            </Col>
        </Row>
    )
}

export default AptOS;