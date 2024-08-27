import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

import API from "../system/api";
import RUNTIME from "../system/runtime";

function CommentSubmit(props) {
  const size = {
    row: [12],
    left: [9,3],
  };

  let [content, setContent ]= useState("");

  const self = {
    changeContent:(ev)=>{
      setContent(ev.target.value);
    },
    clickComment:(ev)=>{
      if(!content) return false;
      const alink=props.alink;
      const address = RUNTIME.account.get();
      //console.log(alink);
      API.comment.submit(address,content,alink,(res)=>{
        if(!res.success) return false;
        setContent("");                       //clean the input content
        if(props.callback) props.callback();      //callback to fresh
      });
    },
  }

  useEffect(() => {
    //console.log(JSON.stringify(props))
  }, [props.alink]);

  return (
    <Row className="pt-4">
      <Col md={size.left[0]} lg={size.left[0]} xl={size.left[0]} xxl={size.left[0]}>
        <input type="text"  className="form-control" placeholder="Comment to submit" 
          value={content} 
          onChange={(ev)=>{
            self.changeContent(ev);
          }}/>
      </Col>
      <Col className="text-end" md={size.left[1]} lg={size.left[1]} xl={size.left[1]} xxl={size.left[1]}>
        <button className="btn btn-md btn-primary" onClick={(ev)=>{
          self.clickComment();
        }}>Comment</button>
      </Col>
    </Row>
  );
}
export default CommentSubmit;