import { Row, Col } from "react-bootstrap";
import { useEffect,useRef } from "react";
import { FaDownload,FaFileUpload } from "react-icons/fa";

import  Data from "../lib/data";
import  tools from "../lib/tools";

function Template(props) {

    const size = {
        row: [12],
        title:[8,4],
    };

    const fileUpload = useRef(null);

    const self={
        changeTemplate:(ev)=>{
            try {
                const fa = ev.target.files[0];
                const reader = new FileReader();
                reader.readAsDataURL(fa);
                reader.onload = (e) => {
                  try {
                    const fa = e.target.result;
                    Data.set("template",fa);
                    const target=Data.get("size");
                    ev.target.value=null;           //reset the uploader
                    if(target!==null){
                        //console.log(JSON.stringify(target));
                        tools.getImageSize(fa,(w,h)=>{
                            const line=Math.floor(w/target.cell[0]);
                            const row=Math.floor(h/target.cell[1]);
                            target.grid=[line,row];
                            Data.set("size",tools.clone(target));
                            props.fresh();
                        });
                    }else{
                        props.fresh();
                    }
                    
                  } catch (error) {

                  }
                };
                reader.readAsText(fa);
            } catch (error) {
            
            }
        },
        clickDownload:()=>{
            const img=Data.get("template");
            if(img===null) return false;
            tools.download("full.png",img,"image");
        },
    };

    useEffect(() => {
        //const target=Data.get("size");
        //console.log(JSON.stringify(target));
    }, [props.update]);

    return (
        <Row>
            <Col lg={size.title[0]} xl={size.title[0]} xxl={size.title[0]}>
                <h5>iNFT Image</h5>
            </Col>
            <Col className="text-end" lg={size.title[1]} xl={size.title[1]} xxl={size.title[1]}>
                <FaFileUpload style={{ color: "rgb(13, 110, 253)", cursor: "pointer"}} onClick={(ev)=>{
                    fileUpload.current.click()
                }}/>  
                <FaDownload style={{ color: "rgb(13, 110, 253)", cursor: "pointer",marginLeft:"10px" }} onClick={(ev)=>{
                    self.clickDownload();
                }}/>
            </Col>
            <Col lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
                <input hidden={true} ref={fileUpload} type="file" accept="image/png, image/jpeg" className="form-control" placeholder="The template file." onChange={(ev)=>{
                    self.changeTemplate(ev);
                }}/>
            </Col>
        </Row>
    )
}

export default Template;