import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

import Data from "../lib/data";

function Value(props) {
    const size = {
        show: [1, 11],
        row: [12],
    };

    let [first, setFirst] = useState("");
    let [second, setSecond] = useState("");
    let [info, setInfo] = useState("");

    const hash = props.hash;
    const start = props.start;
    const step = props.step;
    const divide=props.divide;
    const offset=props.offset;

    const self = {
        firstRow: (hash, start, step) => {
            const c_start = 0, c_end = 32;
            //console.log(start,step,c_end);
            if (start <= c_end) {
                if(start===0){
                    if(start+step>c_end){
                        return setFirst(<p style={{marginBottom:"0px"}}><span className="bg-warning">{hash.slice(start,c_end)}</span></p>)
                    }else{
                        return setFirst(<p style={{marginBottom:"0px"}}><span className="bg-warning">{hash.slice(start,start+step)}</span>{hash.slice(start+step,c_end)}</p>)
                    }
                }else{
                    if(start+step>c_end){
                        return setFirst(<p style={{marginBottom:"0px"}}>{hash.slice(c_start,start)}<span className="bg-warning">{hash.slice(start,c_end)}</span></p>)
                    }else{
                        //console.log(`3`);
                        return setFirst(<p style={{marginBottom:"0px"}}>{hash.slice(c_start,start)}<span className="bg-warning">{hash.slice(start,start+step)}</span>{hash.slice(start+step,c_end)}</p>)
                    }
                }
            } else {
                return setFirst(<p style={{marginBottom:"0px"}}>{hash.slice(c_start, c_end)}</p>);
            }
        },
        secondRow: (hash, start, step) => {
            const c_start = 32, c_end = 64;
            if (start < c_start && start> c_start-step) {
                const offset=c_start-start;
                return setSecond(
                    <p style={{marginBottom:"0px"}}><span className="bg-warning">{hash.slice(c_start,c_start+step-offset)}</span>{hash.slice(c_start+step-offset,c_end)}</p>)
            } else if (start >= c_start && start <= c_end) {
                return setSecond(<p style={{marginBottom:"0px"}}>{hash.slice(c_start,start)}<span className="bg-warning">{hash.slice(start,start+step)}</span>{hash.slice(start+step,c_end)}</p>)
            } else {
                return setSecond(<p style={{marginBottom:"0px"}}>{hash.slice(c_start, c_end)}</p>);
            }
        },
        showResult: (hash, start, step,divide,offset) => {
            const value=hash.slice(start,start+step);
            const int=parseInt("0x"+value);
            setInfo((
                <p style={{marginBottom:"0px"}}>
                    Value: 0x{value} , 
                    Offset: {offset},
                    Result: ( {int} + {offset} ) % {divide} = &nbsp;
                    <span className="bg-warning">&nbsp;{(int+offset)%divide}&nbsp;</span>
                </p>
            ));
        },
        autoFresh:()=>{
            // const hash=Data.get("hash");
            
            // const def = Data.get("NFT");
            // if(def===null){
            //     const [start, step,divide, offset]=[0,1,0,0];
            // }else{
            //     const selected = Data.get("selected");
            //     const part = def.puzzle[selected];
            //     console.log();
            //     const [start, step,divide, offset] = part.value;
                
            // }

            // const str=hash.slice(2,66);
            // self.firstRow(str, start, step);
            // self.secondRow(str, start, step);
            // self.showResult(str,start,step,divide,offset);
        },
    }

    useEffect(() => {
       //self.autoFresh()
        const str=hash.slice(2,66);
        self.firstRow(str, start, step);
        self.secondRow(str, start, step);
        self.showResult(str,start,step,divide,offset);

    }, [props.hash,props.start,props.step,props.divide,props.offset]);

    const cmap={
        background:"#AAEEEE",
        borderRadius:"15px",
        paddingTop:"10px",
        paddingBottom:"10px",
    }

    return (
        <Row style={cmap} >
            <Col className="Monospaced text-center" lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
                <strong>{first}</strong>
            </Col>
            <Col className="Monospaced text-center" lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
                <strong>{second}</strong>
            </Col>
            <Col className="text-center" lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
                {info}
            </Col>
        </Row>
    )
}

export default Value;