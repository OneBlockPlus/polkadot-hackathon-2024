import {  Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

import { FaCode, FaBuromobelexperte } from "react-icons/fa";

/* iNFT mock hash
*   @param  {string}    hash            //hash needed to render the iNFT
*   @param  {array}     active          //selected hash
*   @param  {function}  [callback]      //hash change callback
*/

function MockHash(props) {

  const size = {
    row: [12],
    head: [8, 4],
    grid: [3],
    block:[3],
  };

  let [list, setList] = useState([]);
  let [hash, setHash] = useState("0x");
  let [code, setCode] = useState(true);       //show code mode

  const self = {
    switchCode: (ev) => {
      setCode(!code);
    },
    clickSingle:(index,value)=>{
      //console.log(`Index[${index}]:${value}`);
      const hh="0123456789abcdef";
      const cur=parseInt("0x"+value);
      const val=cur===15?0:cur+1;

      //console.log(val);
      let str=""
      for(let i=0;i<hash.length;i++){
        if(i===(index+2)){
          str+=hh[val];
        }else{
          str+=hash[i];
        }
      }
      //console.log(str);
      setHash(str);
      self.show(str);
      if(props.callback){
        props.callback(str);
      }
    },
    groupHash: (str) => {
      const pure = str.substr(2);
      const arr = [];
      const group = 4;
      let temp = [];
      for (let i = 0; i < pure.length; i++) {
        if (i !== 0 && i % group === 0) {
          arr.push(JSON.parse(JSON.stringify(temp)));
          temp = [];
        }
        temp.push(pure[i]);
      }
      arr.push(JSON.parse(JSON.stringify(temp)));
      return arr;
    },
    show:(data)=>{
      const arr = self.groupHash(data);
      setList(arr);
    },
    checkHashDisable:(index)=>{
      //console.log(index);
      if(!list[index]) return true;
      if(list[index].value[2]===1) return true;
      return false;
    },
  };

  useEffect(() => {
    if (props.hash !== hash) {
      setHash(props.hash);
      self.show(props.hash);
    }
  }, [props.hash,props.selected,props.active]);

  return (
    <Row>
      <Col className="" md={size.head[0]} lg={size.head[0]} xl={size.head[0]} xxl={size.head[0]}>
        <h5>Hash</h5>
      </Col>
      <Col className="text-end" md={size.head[1]} lg={size.head[1]} xl={size.head[1]} xxl={size.head[1]}>
        <button className="btn btn-sm btn-secondary" onClick={(ev) => {
          self.switchCode(ev);
        }}>
        {!code ? <FaBuromobelexperte /> : <FaCode />}
        </button>
      </Col>
      <Col hidden={!code} className="pt-2" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <textarea className="form-control" rows="2" disabled value={hash}></textarea>
      </Col>
      <Col hidden={code} className="pt-2" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <Row style={{paddingLeft:"0px"}}>
          {list.length !== 0 && list.map((row, index) => (
            <Col key={index} md={size.block[0]} lg={size.block[0]} xl={size.block[0]} xxl={size.block[0]}>
              <Row>
              {row.length !== 0 && row.map((single, key) => (
                <Col className="pt-1 text-center" key={key} md={size.grid[0]} lg={size.grid[0]} xl={size.grid[0]} xxl={size.grid[0]}>
                  <button 
                    className={(props.active && props.active.includes(index*row.length+key))?"btn btn-sm btn-warning":"btn btn-sm btn-secondary"} 
                    onClick={()=>{
                      self.clickSingle(index*row.length+key,row[key])
                    }}>{row[key]}</button>
                </Col>
              ))}
              </Row>
            </Col>
          ))}
        </Row>
      </Col>
    </Row>
  );
}
export default MockHash;