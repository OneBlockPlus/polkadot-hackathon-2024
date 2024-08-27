import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

import tools from "../lib/tools";
import TPL from "../lib/tpl";

import { FaChevronRight } from "react-icons/fa";

/* iNFT template launching
*   @param  {string}    alink           //CID of IPFS or anchor link
*   @param  {function}  [dialog]        //system dialog for the next action
*   @param  {function}  [fresh]         //system fresh function       
*/

function Launch(props) {
    const size = {
        row: [12],
    };

    let [logs,setLogs]=useState([]);

    const checking=["version","size","image","grid","cell","parts","series"];
    const format={
        version:(data)=>{
            self.append(`Template version: ${data}`);
        },
        size:(data)=>{
            self.append(`Target iNFT width: ${data[0]}, heigth: ${data[1]}`);
        },
        image:(data)=>{
            //self.append((<image src={data} alt="raw template image" width={"100%"}/>));
            self.append(`Raw image (Base64) size: ${data.length.toLocaleString()} Bytes.`);
        },
        grid:(data)=>{
            self.append(`Raw image grid: ${data[0]} lines, ${data[1]} rows.`);
        },
        cell:(data)=>{
            self.append(`Basic cell size: ${data[0]}px * ${data[1]}px`);
        },
        parts:(data)=>{
            self.append(`${data.length} parts to combine the iNFT.`);
        },
        series:(data)=>{
            self.append(`${data.length} series of this template.`);
        },
    };
    const self = {
        append:(log,type)=>{
            logs.unshift({
                content:log,
                type:!type?"info":type,
                stamp:tools.stamp()
            });
            setLogs(tools.clone(logs));
        },
        decode:(cid,ck,step)=>{
            if(!step) return self.decode(cid,ck,tools.clone(checking));
            if(step.length===0)return ck && ck();
            const key=step.shift();
            if(!format[key]){
                self.append(`Invalid key: ${key}`);
                return self.decode(cid,ck,step);
            }else{
                return TPL.view(cid,(raw)=>{
                    format[key](raw[key]);
                    setTimeout(()=>{
                        return self.decode(cid,ck,step);
                    },200);
                });
            }
        },
        start:(cid,ck)=>{
            self.append(`Start to check iNFT template: ${cid}`);
            if(!cid) return self.append(``);
            setTimeout(()=>{
                self.append(`Fetching IPFS file from network.`);
                TPL.cache([cid],(dels)=>{
                    self.append(`Done, get the content of ${cid}`);
                    setTimeout(()=>{
                        self.append(`Ready to decoding iNFT template.`);
                        self.decode(cid,ck);
                    },200);
                });
            },200);
        },
    }

    useEffect(() => {
        self.start(props.alink,()=>{
            self.append(`Checked, enjoy this new iNFT.`);
        });
    }, []);

    return (
        <Row>
            <Col className="" sm={size.row[0]} xs={size.row[0]}>
                <div className="limited launch">
                    <Row>
                        {logs.map((row, index) => (
                            <p key={index}><FaChevronRight size={14} color={index===0?"#fcabaa":"#666666"}/>{row.content}</p>
                        ))}
                    </Row> 
                </div>
            </Col>
        </Row>
    )
}

export default Launch;