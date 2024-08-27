import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

import { FaTh, FaThLarge, FaThList, FaGem, FaCheck } from "react-icons/fa";

import INFT from "../system/inft";
import TPL from "../system/tpl";

let selected = [];      //selected template, can keep status after rendering
function FilterMarket(props) {
  const size = {
    row: [12],
    grid: [5, 3, 4],
    price: [4, 4, 4]
  };

  let [tpls, setTpls] = useState([]);
  let [min, setMin] = useState(0);
  let [max, setMax] = useState(0);

  let [all, setAll] = useState(true);       //select all status

  const self = {
    changeMin: (ev) => {

    },
    changeMax: (ev) => {

    },
    clickSelectAll: (ev) => {
      if (!all) {
        selected=self.getFullSelected(tpls.length);
        
        const nts=self.copyTpls();
        setTpls(nts);

        const cids = self.getCids();
        props.filter({ template: cids });
        setAll(true);
      }
    },
    checkAll: () => {
      setAll(tpls.length === selected.length);
    },
    getCids: () => {
      const arr = [];
      for (let i = 0; i < tpls.length; i++) {
        arr.push(tpls[i].cid);
      }
      return arr;
    },
    copyTpls:()=>{
      const arr = [];
      for (let i = 0; i < tpls.length; i++) {
        arr.push(tpls[i]);
      }
      return arr;
    },
    getTemplates: (list, ck, arr) => {
      if (arr === undefined) arr = [];
      if (list.length === 0) return ck && ck(arr);
      const cid = list.pop();
      TPL.view(cid, (single) => {
        single.cid = cid;
        arr.push(single);
        return self.getTemplates(list, ck, arr);
      });
    },
    filterByTemplate: (cid) => {
      //1.get the index of template
      let index = null;
      for (let i = 0; i < tpls.length; i++) {
        const row = tpls[i];
        if (row.cid === cid) index = i;
      }
      if (index === null) return false;

      //2.remove or add the selected template
      if (selected.includes(index)) {
        const arr = [];
        for (let i = 0; i < selected.length; i++) {
          if (selected[i] !== index) arr.push(selected[i]);
        }
        selected = arr;
      } else {
        selected.push(index);
      }

      //3.get all template cid to filter
      const vals = [];
      for (let i = 0; i < selected.length; i++) {
        const ii = selected[i];
        const tpl = tpls[ii];
        vals.push(tpl.cid);
      }
      self.checkAll();
      props.filter({ template: vals });
    },
    getFullSelected: (n) => {
      const arr = [];
      for (let i = 0; i < n; i++) arr.push(i);
      return arr;
    },
    getTemplateClass: (index) => {
      return selected.includes(index) ? "template_icon template_selected pointer" : "template_icon template_normal pointer";
    },
  }

  useEffect(() => {
    INFT.overview((dt) => {
      //console.log(JSON.stringify(dt));
      if (dt.template.length !== 0) {
        self.getTemplates(dt.template, (ts) => {
          selected = self.getFullSelected(ts.length);
          setTpls(ts);
        });
        setMin(dt.range[0]);
        setMax(dt.range[1]);
      }
    });
  }, [props.update]);

  return (
    <Row>
      <Col className="pt-2" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <button className={all ? "btn btn-sm btn-primary" : "btn btn-sm btn-default"} onClick={(ev) => {
          self.clickSelectAll();
        }}>
          <FaCheck />
        </button>
        {tpls.map((row, index) => (
          <img className={self.getTemplateClass(index)} key={index} src={row.thumb} alt="" onClick={(ev) => {
            self.filterByTemplate(row.cid);
          }} />
        ))}
        <span className="ml-10">|</span>
        <FaThList size={28} className="filter_icon ml-10" />
        <FaThLarge size={28} className="filter_icon ml-10" />
        <FaTh size={28} className="filter_icon ml-10" />
        <span className="ml-10">|</span>
        <FaGem size={18} className="ml-10" />
        <span className="ml-5">{min}~{max}</span>
        {/* <Row hidden={!editing}>
          <Col md={size.price[0]} lg={size.price[0]} xl={size.price[0]} xxl={size.price[0]}>
            <input type="number" className="form-control" placeholder="Min" value={min} onChange={(ev)=>{
              self.changeMin(ev);
            }}/>
          </Col>
          <Col md={size.price[1]} lg={size.price[1]} xl={size.price[1]} xxl={size.price[1]}>
            <input type="number" className="form-control" placeholder="Max" value={max} onChange={(ev)=>{
              self.changeMax(ev);
            }}/>
          </Col>
          <Col className="text-end" md={size.price[2]} lg={size.price[2]} xl={size.price[2]} xxl={size.price[2]}>
            <button className="btn btn-sm btn-primary mt-1">Search</button>
          </Col>
        </Row>
        <Row hidden={editing}>
          <Col  md={size.price[0]} lg={size.price[0]} xl={size.price[0]} xxl={size.price[0]}></Col>
          <Col className="pt-1 text-end" md={size.price[1]} lg={size.price[1]} xl={size.price[1]} xxl={size.price[1]}></Col>
          <Col className="text-end" md={size.price[2]} lg={size.price[2]} xl={size.price[2]} xxl={size.price[2]}>
            <FaGem size={18}/>
            <span className="ml-5">{min}~{max}</span> 
          </Col>
        </Row> */}
      </Col>
    </Row>
  );
}
export default FilterMarket;