import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

import tools from "../lib/tools";

/* iNFT render component parameters
*   @param  {number}    start           //count start tag
*   @param  {number}    duration        //duration of the count
*/


let timer=null;
function Counter(props) {
    const size = {
        row: [12],
    };

    let [circleLeft,setLeft]=useState("circle-pro leftstatic");
    let [circleRight,setRight]=useState("circle-pro rightstatic");
    let [info,setInfo]=useState("");

    const self = {
        start:()=>{
            setLeft("circle-pro leftcircle");
            setRight("circle-pro rightcircle");

            let count=props.duration*10;
            timer=setInterval(()=>{
                
                if(count===0){
                    count=props.duration*10;
                    clearInterval(timer);
                    timer=null;
                    return self.stop();
                } 
                count--;

                //set the left time
                if(count<30){
                    setInfo(`${tools.toF(count*0.1,1)} s`);
                }else{
                    setInfo(`${Math.ceil(count*0.1)} s`);
                }
            },100);
        },
        stop:(ck)=>{
            if(timer!==null) clearInterval(timer);
            setLeft("circle-pro leftstatic");
            setRight("circle-pro rightstatic");
            return ck && ck();
        },
    }
    //console.log(props);

    useEffect(() => {
        if(props.start!==0)self.stop(()=>{
            self.start();
        })
    }, [props.start]);

    return (
        <Row className="pt-2">
            <Col sm={size.row[0]} xs={size.row[0]}>
                <div className="circle-box">
                    <div className="circle-item right">
                        <div className={circleRight}></div>
                    </div>
                    <div className="circle-item left">
                        <div className={circleLeft}></div>
                    </div>
                    <p className="circle-text">{info}</p>
                </div>
            </Col>
        </Row>
    )
}

export default Counter;