import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

import Hash from "./hash";
import Counter from "./counter";
import RenderiNFT from "./inft";

import TPL from "../lib/tpl";
import tools from "../lib/tools";
import Data from "../lib/data";

import Network from "../network/router";

let animate = false;   //wether iNFT render animation
let saving_hash = "";
let saving_block = 0;
let updating=null;
function Preview(props) {
    const size = {
        row: [12],
        header: (window.screen.width > 414 ? [4, 8] : [3, 9]),      //here to adjust to different device
        single: [1, 10, 1],
    };

    let [block, setBlock] = useState(0);
    let [hash, setHash] = useState("0x000000000000000000000000000000000000000000000000000000000000000");
    let [start, setStart] = useState(0);
    let [active, setActive] = useState(0);
    let [force, setForce] = useState(false);      //wether force to fresh the iNFT
    let [network, setNetwork] = useState("");

    let timer = null
    const self = {
        randomActive: () => {
            if(animate){
                clearTimeout(timer);
                return false;
            }
            const tpl = TPL.current();
            if (tpl === null){
                timer=setTimeout(() => {
                    self.randomActive();
                }, 2000);
                return true;
            } 

            setActive(tools.rand(1, tpl.parts.length - 1));       //be set multi times, no sure why
            setForce(true);
            timer=setTimeout(() => {
                self.randomActive();
            }, 2000);
        },
        fresh: () => {
            const cur = Data.getHash('cache', 'network');
            setNetwork(cur);
            setTimeout(() => {
                const cur = Data.getHash('cache', 'network');
                Network(cur).subscribe("preview", (bk, bhash) => {
                    saving_hash = bhash;
                    saving_block = bk;
                });
            }, 50);
        },
        updateHash: () => {
            //console.log(`Freshing...`);
            if(updating===null){
                //console.log(`Set inverval timer to show.`);
                start++;
                setStart(start);        //start counter at first running

                updating=setInterval(()=>{
                    //clearTimeout(timer);
                    start++;
                    setStart(start);        //start counter at right time

                    //1.fresh the hash
                    if(!saving_hash || !saving_block) return false;

                    setForce(false);
                    animate = true;
                    setHash(saving_hash);
                    setBlock(saving_block);

                    timer=setTimeout(()=>{
                        animate = false;
                        self.randomActive();
                    },5000);
                },12000);
            }
        },
    }

    useEffect(() => {
        self.fresh();
        self.updateHash();
    }, [props.update]);

    return (
        <Row className="pt-2">
            <Col className="text-center" sm={size.row[0]} xs={size.row[0]}>
                <RenderiNFT
                    hash={hash}
                    offset={[]}
                    id={"pre_home"}
                    hightlight={active}
                    force={force}
                    animate={animate}
                    callback={() => {
                        //animate = false;
                    }}
                />
            </Col>
            <Col className="text-center pb-2" sm={size.row[0]} xs={size.row[0]}>
                Block {block.toLocaleString()}, {tools.toUp(network)} Network
            </Col>
            <Col className="text-center pt-3" sm={size.header[0]} xs={size.header[0]}>
                <Counter start={start} duration={12} />
            </Col>
            <Col sm={size.header[1]} xs={size.header[1]}>
                <Hash hash={hash} active={active} />
            </Col>
        </Row>
    )
}

export default Preview;