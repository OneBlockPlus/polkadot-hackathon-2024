import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";
import { FaSkullCrossbones } from "react-icons/fa";

import tools from "../lib/tools";
import Bounty from "../system/bounty";

function BountyTarget(props) {
  const size = {
    row: [12],
    normal: [9, 3],
    bonus: [3, 4, 4, 1],
  };

  let [list, setList] = useState([]);
  let [modify,setModify] = useState(true);    //wether modifyable
  
  const single = {
    series: 0,
    bonus: 10,
    amount: 1
  };

  const self = {
    clickAdd: (ev) => {
      const nlist = tools.clone(list);
      nlist.push(tools.clone(single));
      setList(nlist);
    },
    clickReset:()=>{
      self.fresh();
    },
    clickRemove: (index) => {
      const nlist = [];
      for (let i = 0; i < list.length; i++) {
        if (i !== index) nlist.push(list[i]);
      }
      setList(nlist);
      self.update(nlist);
    },
    changeBonus:(ev,index)=>{
      list[index].bonus=parseInt(ev.target.value);
      self.update(list);
    },
    changeAmount:(ev,index)=>{
      list[index].amount=parseInt(ev.target.value);
      self.update(list);
    },
    update:(data)=>{
      const dt=tools.clone(data)
      setList(dt);
      if(props.callback) props.callback(data);
    },
    fresh:()=>{
      if(!props.data || !props.data.series) return false;
      const nlist=[];
      for(let i=0;i<props.data.series.length;i++){
        const se=props.data.series[i];
        const row=tools.clone(single);
        row.series=i;
        row.thumb=se.thumb[0];
        row.name=se.name;
        nlist.push(row);
      }
      setList(nlist);
      self.update(nlist);
    },
    selected:(bonus)=>{
      if(!props.data || !props.data.series) return false;

      const nlist=[];
      for(let i=0;i<bonus.length;i++){
        const row=tools.clone(bonus[i]);
        //console.log(row,props.data.series);
        const se=props.data.series[row.series];
        row.thumb=se.thumb[0];
        row.name=se.name;
        nlist.push(row);
      }
      setList(nlist);
      self.update(nlist);
    },
  }

  useEffect(() => {
    if(props.link){
      Bounty.get(props.link,(dt)=>{
        if(!dt.error){
          self.selected(dt.bonus);
          setModify(false);
        }else{
          self.fresh();
        }
        // if(dt.length!==0){
        //   self.selected(dt[0].bonus);
        //   setModify(false);
        // }else{
        //   self.fresh();
        // }
      });
    }else{
      self.fresh();
    }
  }, [props.data,props.bonus]);

  return (
    <Row>
      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}><hr/></Col>
      <Col className="pt-1" md={size.normal[0]} lg={size.normal[0]} xl={size.normal[0]} xxl={size.normal[0]}>
        Select the series to bonus.
      </Col>
      <Col className="text-end pt-1" md={size.normal[1]} lg={size.normal[1]} xl={size.normal[1]} xxl={size.normal[1]}>
        <button hidden={!modify} className="btn btn-sm btn-danger" onClick={(ev) => {
          self.clickReset();
        }}>Reset</button>
      </Col>
      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>

        <Row hidden={list.length === 0} className="pt-1">
          <Col md={size.bonus[0]} lg={size.bonus[0]} xl={size.bonus[0]} xxl={size.bonus[0]} >Series</Col>
          <Col md={size.bonus[1]} lg={size.bonus[1]} xl={size.bonus[1]} xxl={size.bonus[1]} >Bonus</Col>
          <Col md={size.bonus[2]} lg={size.bonus[2]} xl={size.bonus[2]} xxl={size.bonus[2]} >Amount</Col>
          <Col md={size.bonus[3]} lg={size.bonus[3]} xl={size.bonus[3]} xxl={size.bonus[3]} ></Col>
        </Row>

        {list.map((row, index) => (
          <Row key={index} className="pt-1">
            <Col md={size.bonus[0]} lg={size.bonus[0]} xl={size.bonus[0]} xxl={size.bonus[0]} >
              <img className="template_icon" src={row.thumb} alt={row.name} /> #{row.series} {row.name}
            </Col>
            <Col md={size.bonus[1]} lg={size.bonus[1]} xl={size.bonus[1]} xxl={size.bonus[1]} >
              <input disabled={!modify} className="form-control" type="number" value={row.bonus} onChange={(ev) => {
                self.changeBonus(ev,index);
              }} />
            </Col>
            <Col md={size.bonus[2]} lg={size.bonus[2]} xl={size.bonus[2]} xxl={size.bonus[2]} >
              <input disabled={!modify}  className="form-control" type="number" value={row.amount} onChange={(ev) => {
                self.changeAmount(ev,index);
              }} />
            </Col>
            <Col className="text-end" md={size.bonus[3]} lg={size.bonus[3]} xl={size.bonus[3]} xxl={size.bonus[3]} >
              <button hidden={!modify} className="btn btn-sm btn-danger" onClick={(ev) => {
                self.clickRemove(index);
              }}><FaSkullCrossbones /></button>
            </Col>
          </Row>
        ))}
      </Col>
      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}><hr/></Col>
    </Row>
  );
}
export default BountyTarget;