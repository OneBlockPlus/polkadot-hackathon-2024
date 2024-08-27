import { Row, Col } from "react-bootstrap";
import { useEffect,useRef } from "react";
import { FaDownload,FaFileUpload } from "react-icons/fa";

import  Data from "../lib/data";
import  tools from "../lib/tools";

function NFT(props) {
    const size = {
        row: [12],
        title:[8,4],
    };

    const fileUpload = useRef(null);

    const self={
        changeDef:(ev)=>{
            try {
                const fa = ev.target.files[0];
                const reader = new FileReader();
                reader.onload = (e) => {
                  try {
                    const fa = JSON.parse(e.target.result);
                    //1.加载NFT的定义
                    const NFT={
                        puzzle:fa.parts,
                        series:fa.series,
                    }
                    Data.set("NFT",NFT);

                    //2.加载图像文件
                    if(fa.image){
                        Data.set("template",fa.image);
                    }

                    //3.更新基本参数
                    const imp_size={
                        cell:fa.cell,
                        grid:fa.grid,
                        target:fa.size,
                    };
                    Data.set("size",imp_size);
                    ev.target.value=null;           //reset the uploader
                    props.fresh();
                  } catch (error) {
                    
                  }
                };
                reader.readAsText(fa);
            } catch (error) {
            
            }
        },
        clickDownload:(ev)=>{
            const def=Data.get("NFT");
            if(def===null) return false;
            delete def.format;
            //console.log(self.getNFTData(2));
            tools.download("iNFT.json",JSON.stringify(self.getNFTData(2)));
        },
        getNFTData: (type) => {
            const bs64 = Data.get("template");
            const NFT = Data.get("NFT");
            const basic = Data.get("size");
            if (bs64===null || NFT === null || basic == null) return false;

            //1.清理不需要的数据

            return {
                size: basic.target,  //图像的基本配置
                cell: basic.cell,    //图像的裁切
                grid: basic.grid,
                parts: NFT.puzzle,        //图像的组成
                series:self.cleanSeries(NFT.series),      //rarity的构成
                type: type,             //2D的图像， [1.像素化产品;2.2D图像;3.3D模型]
                image: bs64,         //图像的base64编码，带前缀
                version:"2024_flamingo",    //增加版本 
            }
        },
        cleanSeries:(obj)=>{
            const arr=tools.clone(obj);
            const result=[];
            for(let i=0;i<arr.length;i++){
                const row=arr[i];
                result.push({name:row.name,desc:row.desc});
            }
            return result;
        },
    };

    useEffect(() => {

    }, []);

    return (
        <Row>
            <Col lg={size.title[0]} xl={size.title[0]} xxl={size.title[0]}>
                <h5>iNFT Components</h5>
            </Col>
            <Col className="text-end" lg={size.title[1]} xl={size.title[1]} xxl={size.title[1]}>
                <FaFileUpload style={{ color: "rgb(13, 110, 253)", cursor: "pointer"}} onClick={(ev)=>{
                    fileUpload.current.click()
                }}/>
                {/* <FaPuzzlePiece style={{ color: "rgb(13, 110, 253)", cursor: "pointer",marginLeft:"10px" }} onClick={(ev)=>{
                    self.clickDownload();
                }}/> */}
                <FaDownload style={{ color: "rgb(13, 110, 253)", cursor: "pointer",marginLeft:"10px" }} onClick={(ev)=>{
                    self.clickDownload();
                }}/>  
            </Col>
            <Col lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
                {/* <small>Select the iNFT definition JSON file.</small> */}
                <input hidden={true} ref={fileUpload} className="form-control" 
                    type="file" accept="application/JSON" placeholder="The iNFT definition." onChange={(ev)=>{
                    self.changeDef(ev);
                }}/>
            </Col>
        </Row>
    )
}

export default NFT;