import { Row, Col, ButtonToolbar, ButtonGroup } from 'react-bootstrap';
import { useEffect, useState } from "react";

/* common page component parameters
*   @param  {number}    [total]      //total page number
*   @param  {boolean}   [show]      //wether hidden
*   @param  {string}    [align]     //["left","right","center"] 
*   @param  {number}    [now]       //current page, default 1
*   @param  {number}    [step]      //how many page buttons to show
*   @param  {function}  [callback]  //callback function, callback the selected page
*/

function Page(props) {

  const size = {
    row: [12],
    board: [3]
  };

  let [current, setCurrent] = useState(1);
  let [list, setList] = useState([]);

  const self = {
    clickStart: (ev) => {
      props.callback && props.callback(1);
    },
    clickPrevious: (ev) => {
      if (current - props.step < 1) {
        props.callback && props.callback(1);
      } else {
        props.callback && props.callback(current - props.step);
      }
    },
    clickNext: (ev) => {
      if (current + props.step > props.total) {
        props.callback && props.callback(props.total);
      } else {
        props.callback && props.callback(current + props.step);
      }
    },
    clickEnd: (ev) => {
      props.callback && props.callback(props.total);
    },
    getButtons:(current, step, total)=>{
      //console.log(current,step,total);
      const narr=[];
      const count=Math.floor(current/step);
      const start=(current%step===0?count-1:count)*step;
      for (let i = 0; i < step; i++) {
        narr.push({ page: start + i + 1 });
      }
      return narr;
    },
    getCenterButtons: (current, step, total) => {
      
      const narr = [{ page: current }];
      for (let i = 0; i < step; i++) {
        if (current - i - 1 < 1) continue;
        narr.unshift({ page: current - i - 1 });
      }

      for (let i = 0; i < step; i++) {
        if (current + i + 1 > total) continue;
        narr.push({ page: current + i + 1 });
      }

      //console.log(narr);
      return narr;
    },
    fresh: () => {
      setCurrent(props.now);
      const arr = self.getButtons(props.now, props.step, props.total);
      setList(arr);
    }
  }

  useEffect(() => {
    self.fresh();
  }, [props.now, props.total, props.step]);

  return (

    <Row hidden={!props.show} className='pt-2'>
      <Col md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <ButtonToolbar aria-label="Toolbar with button groups">
          <ButtonGroup className="me-2" aria-label="First group">
            <button className='btn btn-md btn-default' onClick={(ev) => {
              self.clickStart(ev);
            }}>{"|<<"}</button>
            <button className='btn btn-md btn-default' onClick={(ev) => {
              self.clickPrevious(ev);
            }}>{"<"}</button>
            {list.map((row, index) => (
              <button
                key={index}
                className={row.page === current ? 'btn btn-md btn-primary' : 'btn btn-md btn-default'}
                onClick={(ev) => {
                  props.callback && props.callback(row.page);
                }}>
                {row.page}
              </button>
            ))}
            <button className='btn btn-md btn-default' onClick={(ev) => {
              self.clickNext(ev);
            }}>{">"}</button>
            <button className='btn btn-md btn-default' onClick={(ev) => {
              self.clickEnd(ev);
            }}>{">>|"}</button>
          </ButtonGroup></ButtonToolbar>
      </Col>
    </Row>
  );
}
export default Page;