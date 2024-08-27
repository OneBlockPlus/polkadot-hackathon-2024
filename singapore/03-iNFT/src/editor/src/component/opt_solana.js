import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

import SOL from "../network/solana";
import APT from "../network/aptos";

function Solana(props) {
    const size = {
        row: [12],
    };

    const self={
        clickWrite:(ev)=>{
            //console.log(window.phantom);
            SOL.wallet((signer)=>{
                // SOL.airdrop(signer.publicKey,3,(res)=>{
                //     console.log(res);
                // },"devnet");

                const data={
                    target:"hello world",
                    stamp:0,
                };

                SOL.storage(data,(txHash)=>{
                    console.log(txHash);
                },signer,"devnet");
            });
        },
        clickRun:(ev)=>{
            const program_id="k6cgN7HWWcZwAXAuguSZu6SWTiVxPM6hsXNzjQtuFPF";
            SOL.run(program_id,{},(res)=>{
                console.log(res);
            },"devnet");
        },
    };

    useEffect(() => {
        APT.generate();
        
    }, [props.update]);

    return (
        <Row className="pt-2">
            <Col lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                Check Solana information here to confirm the operation of writing to account validly.
            </Col>
            <Col className="text-end pt-2" lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                <button className="btn btn-md btn-primary" onClick={(ev)=>{
                    self.clickWrite(ev);
                    //self.clickRun(ev);
                }}>Phantom</button>
            </Col>
        </Row>
    )
}

export default Solana;