import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

import  Data from "../lib/data";
import tools from "../lib/tools";

function Basic(props) {
    const size = {
        row: [12],
        grid: [6,6],
    };
    const ss=Data.get("size");
    let [width,setWidth]=useState((ss.target===undefined || !ss.target[0])?400:ss.target[0]);
    let [height,setHeight]=useState((ss.target===undefined || !ss.target[1])?400:ss.target[1]);
    let [cellX,setCellX]=useState((ss.cell===undefined || !ss.cell[0])?50:ss.cell[0]);      //cell的X轴像素宽度
    let [cellY,setCellY]=useState((ss.cell===undefined || !ss.cell[1])?50:ss.cell[1]);      //cell的Y轴像素宽度
    let [line,setLine]=useState((ss.grid===undefined || !ss.grid[0])?8:ss.grid[0]);        //X轴，每行多少个
    let [row,setRow]=useState((ss.grid===undefined || !ss.grid[1])?8:ss.grid[1]);          //Y轴，多少行

    const self={
        changeWidth:(ev)=>{
            const val=parseInt(ev.target.value);
            const min=180,max=900;
            if(isNaN(val) || val<min){
                setWidth(min);
                self.saveSize(cellX,cellY,line,row,min,height);
                return true;
            }

            if(val>max){
                setWidth(max);
                self.saveSize(cellX,cellY,line,row,max,height);
                return true;
            }

            setWidth(val);
            self.saveSize(cellX,cellY,line,row,val,height);
        },
        changeHeight:(ev)=>{
            const val=parseInt(ev.target.value);
            const min=100,max=600;

            if(isNaN(val) || val<min){
                setHeight(min);
                self.saveSize(cellX,cellY,line,row,width,min);
                return true;
            }

            if(val>max){
                setHeight(max);
                self.saveSize(cellX,cellY,line,row,width,max);
                return true;
            }

            setHeight(val);
            self.saveSize(cellX,cellY,line,row,width,val);
        },
        changeCellX:(ev)=>{
            const val=parseInt(ev.target.value);
            const min=10,max=300;
            if(isNaN(val) || val<min){
                setCellX(min);
                self.saveSize(min,cellY,line,row,width,height);
                return true;
            }

            if(val>max){
                setCellX(max);
                self.saveSize(max,cellY,line,row,width,height);
                return true;
            }

            const bs64=Data.get("template");
            if(bs64===null){
                //不存在图像，仅保存数据
                setCellX(val);
                self.saveSize(val,cellY,line,row,width,height);
            }else{
                tools.getImageSize(bs64,(w,h)=>{
                    //console.log(w,h);
                    const nline=Math.floor(w/val);
                    setCellX(val);
                    setLine(nline);
                    self.saveSize(val,cellY,nline,row,width,height);
                })
            }
        },
        changeCellY:(ev)=>{
            const val=parseInt(ev.target.value);
            const min=10,max=300;
            if(isNaN(val) || val<min){
                setCellY(min);
                self.saveSize(cellX,min,line,row,width,height);
                return true;
            }

            if(val>max){
                setCellY(max);
                self.saveSize(cellX,max,line,row,width,height);
                return true;
            }

            const bs64=Data.get("template");
            if(bs64===null){
                //不存在图像，仅保存数据
                setCellY(val);
                self.saveSize(cellX,val,line,row,width,height);
            }else{
                tools.getImageSize(bs64,(w,h)=>{
                    const nrow=Math.floor(h/val);
                    setCellY(val);
                    setRow(nrow);
                    self.saveSize(cellX,val,line,nrow,width,height);
                })
            }
        },
        changeLine:(ev)=>{
            const val=parseInt(ev.target.value);
            if(!isNaN(val)){
                setLine(val);
                self.saveSize(cellX,cellY,val,row,width,height);
            }
        },
        changeRow:(ev)=>{
            const val=parseInt(ev.target.value);
            if(!isNaN(val)){
                setRow(val);
                self.saveSize(cellX,cellY,line,val,width,height);
            }
        },
        clickGrid:(index)=>{
            //console.log(`Index ${index} clicked.`);
            Data.set("grid",index);
            self.updateHash(index);
            props.fresh();
        },
        saveSize:(cx,cy,gx,gy,w,h)=>{
            const param={
                target:[w,h],
                cell:[cx,cy],
                grid:[gx,gy],
            }
            //console.log(param);
            Data.set("size",param);
            props.fresh();
        },
        updateHash:(order)=>{
            const puzzle_index=Data.get("selected");
            const NFT=Data.get("NFT");
            const hash=Data.get("hash");
            const def=NFT.puzzle[puzzle_index];
            const [hash_start,hash_step,amount]=def.value;
            console.log(self.getHash(hash,order,hash_start,hash_step,amount));
            Data.set("hash",self.getHash(hash,order,hash_start,hash_step,amount));
        },
        getHash:(hash,order,start,step,max)=>{
            const s=16;
            const top=Math.pow(s,step);         //总数据量
            const m=Math.floor(top/max)-1;
            const multi=tools.rand(0,m);
            const n=multi*max+order;

            const px=2;
            const prefix=hash.substring(0,start+px);
            const tailor=hash.substring(start+step+px,hash.length+px);
            return `${prefix}${n.toString(16)}${tailor}`;
        },
        autoFresh:()=>{
            const ss=Data.get("size");
            if(ss.target!==undefined){
                setWidth(ss.target[0]);
                setHeight(ss.target[1]);
            }

            if(ss.cell!==undefined){
                setCellX(ss.cell[0]);      //cell的X轴像素宽度
                setCellY(ss.cell[1]);      //cell的Y轴像素宽度
            }

            if(ss.grid!==undefined){
                setLine(ss.grid[0]);        //X轴，每行多少个
            setRow(ss.grid[1]);          //Y轴，多少行
            }
        },
    }

    useEffect(() =>{
        self.autoFresh();
    }, [props.update]);

    return (
        <Row className="pt-2">
            <Col lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
                <h5>Basic parameters</h5>
            </Col>
            <Col lg={size.grid[0]} xl={size.grid[0]} xxl={size.grid[0]}>
                <small>NFT Width</small>
                <input className="form-control" type="number" value={width} onChange={(ev)=>{
                    self.changeWidth(ev);
                }}/>
            </Col>
            <Col lg={size.grid[1]} xl={size.row[1]} xxl={size.grid[1]}>
                <small>NFT Height</small>
                <input className="form-control" type="number" value={height} onChange={(ev)=>{
                    self.changeHeight(ev);
                }}/>
            </Col>
            <Col lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
                <hr />
            </Col>

            <Col lg={size.grid[0]} xl={size.grid[0]} xxl={size.grid[0]}>
                <small>Cell X</small>
                <input className="form-control" type="number" value={cellX} onChange={(ev)=>{
                    self.changeCellX(ev);
                }}/>
            </Col>
            <Col lg={size.grid[1]} xl={size.row[1]} xxl={size.grid[1]}>
                <small>Cell Y</small>
                <input className="form-control" type="number" value={cellY} onChange={(ev)=>{
                    self.changeCellY(ev);
                }}/>
            </Col>
            <Col lg={size.grid[0]} xl={size.grid[0]} xxl={size.grid[0]}>
                <small>Lines</small>
                <input disabled={true} className="form-control" type="number" value={line} onChange={(ev)=>{
                    self.changeLine(ev);
                }}/>
            </Col>
            <Col lg={size.grid[1]} xl={size.row[1]} xxl={size.grid[1]}>
                <small>Rows</small>
                <input disabled={true} className="form-control" type="number" value={row} onChange={(ev)=>{
                    self.changeRow(ev)
                }}/>
            </Col>
        </Row>
    )
}

export default Basic;