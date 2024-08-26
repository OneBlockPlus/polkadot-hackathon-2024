import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

import Rarity from "./rarity";

import  Data from "../lib/data";
import tools from "../lib/tools";

function Detail(props) {
    const size = {
        row: [12],
        value:[3,3,3,3],
        center:[3,3],
        img:[3,3,3,3],
        position:[3,3],
        rotation:[3],
    };

    let [hidden,setHidden] = useState(true);

    let [value_start,setValueStart]=useState(0);
    let [value_step,setValueStep]=useState(0);
    let [value_divide,setValueDivide]=useState(0);
    let [value_offset,setValueOffset]=useState(0);
    
    let [img_line,setImageLine] =useState(0);
    let [img_row, setImageRow] =useState(0);
    let [img_ext_x,setImageEx]=useState(0);
    let [img_ext_y,setImageEy]=useState(0);

    let [center_x,setCenterX]=useState(0);
    let [center_y,setCenterY]=useState(0);

    let [pos_x, setPosX]= useState(0);
    let [pos_y, setPosY]= useState(0);

    let [rotation,setRotation]=useState(0);

    let [rare, setRare]=useState("");

    //集中调用的router，来优化参数检测
    const router={
        "position_0":setPosX,
        "position_1":setPosY,
    }

    const self={
        autoTask:(arr)=>{
            const active=Data.get("selected");
            const def=Data.get("NFT");
            if(active===null || def===null) return false;
            const data={
                value:[value_start,value_step,value_divide,value_offset],
                img:[img_line,img_row,img_ext_x,img_ext_y],
                position:[pos_x,pos_y],
                center:[center_x,center_y],
            }
            if(def.puzzle[active].rarity!==undefined){
                data.rarity=def.puzzle[active].rarity;
            }
            def.puzzle[active]=data;

            for(let i=0;i<arr.length;i++){
                const [key,index,val]=arr[i];
                def.puzzle[active][key][index]=val;
            }
            const changed=tools.clone(def);
            Data.set("NFT",changed);
            props.fresh();
        },
        autoSave:(key,index,val,pending)=>{
            const active=Data.get("selected");
            const def=Data.get("NFT");
            if(active===null || def===null) return false;
            const data={
                value:[value_start,value_step,value_divide,value_offset],
                img:[img_line,img_row,img_ext_x,img_ext_y],
                position:[pos_x,pos_y],
                center:[center_x,center_y],
                rotation:[rotation],
            }
            if(def.puzzle[active].rarity!==undefined){
                data.rarity=def.puzzle[active].rarity;
            }

            //console.log(def);
            def.puzzle[active]=data;
            def.puzzle[active][key][index]=val;
            const changed= tools.clone(def);
            Data.set("NFT",changed);

            if(!pending){   //更新数据
                props.fresh();
            }
        },
        changeValueStart:(ev)=>{
            const val=parseInt(ev.target.value);

            const hash=Data.get("hash");
            const min=0,index=0,limit=hash.length-2;

            //1.处理非正常数据、删除的操作，重置为1
            if(isNaN(val) || val<min){
                setValueStart(min);
                self.autoSave("value",index,min);
                return false;
            }

            //2.处理顶到step的问题
            const max=limit-value_step;
            if(val<max){
                setValueStart(val);
                self.autoSave("value",index,val);
                return true;
            }else{
                const index_step=1;
                if(val >= limit-1){
                    //2.1.顶到hash的长度限制了
                    setValueStart(limit-1);
                    setValueStep(1);            //保留一位取值
                    const task=[
                        ["value",index,limit-1],
                        ["value",index_step,1],
                    ]
                    self.autoTask(task)
                    return true;
                }else{
                    const fix_step=limit-val;
                    setValueStart(val);
                    setValueStep(fix_step);            //保留一位取值
                    const task=[
                        ["value",index,val],
                        ["value",index_step,fix_step],
                    ]
                    self.autoTask(task);
                    return true;
                }
            }
        },

        //TODO, 还需要对divide进行修正
        changeValueStep:(ev)=>{
            const val=parseInt(ev.target.value);
            //const min=1,index=1,limit=12;
            const min=1,index=1,limit=9;

            //0.最小值带来的联动处理
            if(val===min && value_divide>16){
                console.log(`here?`);
                const index_divide=2;
                setValueStep(val);            //保留一位取值
                setValueDivide(16);
                const task=[
                    ["value",index,val],
                    ["value",index_divide,16],
                ]
                if(value_offset>16){
                    const index_offset=3;
                    setValueOffset(16);
                    task.push(["value",index_offset,16])
                }
                self.autoTask(task);
                return true;
            }

            //1.处理异常数据
            if(isNaN(val) || val<min){
                    setValueStep(min);
                    self.autoSave("value",index,min);
                    return false;
            }

            //2.处理过大的异常
            if(val>limit){
                setValueStep(limit);
                self.autoSave("value",index,limit);
                return false;
            }

            const hash=Data.get("hash");
            const len=hash.length-2;
            const max=len-value_start;

            const index_start=0;
            if(val>len){
                //3.超出总长度的控制，全部为取值（和limit冲突，取不到）
                setValueStart(0);
                setValueStep(len);            //保留一位取值
                const task=[
                    ["value",index_start,0],
                    ["value",index,len],
                ]
                self.autoTask(task);
                return true;
            }else{
                if(val>max){
                    //4.修正start的位置的情况
                    setValueStart(len-val);
                    setValueStep(val);            //保留一位取值
                    const task=[
                        ["value",index_start,len-val],
                        ["value",index,val],
                    ]
                    self.autoTask(task)
                    return true;
                }else{
                    if(val===1 && value_divide>16){
                        //5.对divide进行修正
                        const index_offset=3;
                        setValueStep(val);            //保留一位取值
                        setValueOffset(16);
                        const task=[
                            ["value",index,val],
                            ["value",index_offset,16],
                        ]
                        self.autoTask(task);
                    }else{
                        setValueStep(val);
                        self.autoSave("value",index,val);
                        return true;
                    }
                   
                }
            }
        },
        changeValueDivide:(ev)=>{
            const val=parseInt(ev.target.value);
            const min=1,index=2;
            const limit=value_step>2?256:Math.pow(16,value_step);

            //1.最小和异常的处理
            if(isNaN(val) || val<min){
                setValueDivide(min);
                self.autoSave("value",index,min);
                return false;
            }

            //2.处理过大的异常
            if(val>limit){
                setValueStep(limit);
                self.autoSave("value",index,limit);
                return false;
            }

            //3.对offset进行同步修正
            if(val<value_offset){
                const index_offset=3;

                setValueDivide(val);
                setValueOffset(val);            //保留一位取值
                const task=[
                    ["value",index_offset,val],
                    ["value",index,val],
                ]
                self.autoTask(task)
                return true;

            }else{
                setValueDivide(val);
                self.autoSave("value",2,val);
                return true;
            }
        },
        changeValueOffset:(ev)=>{
            const val=parseInt(ev.target.value);
            const index=3,min=0;
            const limit=value_divide;

             //1.最小和异常的处理
            if(isNaN(val) || val<min){
                setValueOffset(min);
                self.autoSave("value",index,min);
                return true;
            } 

            //2.处理过大的异常
            if(val>limit){
                setValueStep(limit);
                self.autoSave("value",index,limit);
                return true;
            }

            setValueOffset(val);
            self.autoSave("value",index,val);
        },
        changeImageLine:(ev)=>{
            const val=parseInt(ev.target.value);
            if(isNaN(val) || val<0){
                setImageLine(0);
                self.autoSave("img",0,0);
                return false;
            }
            setImageLine(val);
            self.autoSave("img",0,val);

            //1.最大端超出图像下部范围的检测
        },
        changeImageRow:(ev)=>{
            const val=parseInt(ev.target.value);
            if(isNaN(val) || val<0){
                setImageRow(0);
                self.autoSave("img",1,0);
                return false;
            }
            setImageRow(val);
            self.autoSave("img",1,val);
            //1.最大端超出图像下部范围的检测
        },
        
        changeImageEX:(ev)=>{
            const val=parseFloat(ev.target.value);
            if(isNaN(val) || val<0){
                setImageEx(0);
                self.autoSave("img",2,0);
                return false;
            }
            setImageEx(val);
            self.autoSave("img",2,val);
            //1.超出横向范围的检测
            //2.超出图像下部范围的检测
        },
        changeImageEY:(ev)=>{
            const val=parseFloat(ev.target.value);
            if(isNaN(val) || val<0){
                setImageEy(0);
                self.autoSave("img",3,0);
                return false;
            }
            setImageEy(val);
            self.autoSave("img",3,val);
            //1.超出横向范围的检测
            //2.超出图像下部范围的检测
        },
        changeCenterX:(ev)=>{
            const val=parseFloat(ev.target.value);
            const index=0,min=0;
            const limit=1;

            if(isNaN(val) || val<min){
                setCenterX(min);
                self.autoSave("center",index,min);
                return true;
            }

            if(val > limit){
                setCenterX(limit);
                self.autoSave("center",index,limit);
                return true;
            }


            setCenterX(val);
            self.autoSave("center",index,val);
        },
        changeCenterY:(ev)=>{
            const val=parseFloat(ev.target.value);
            const index=1,min=0;
            const limit=1;

            if(isNaN(val) || val<min){
                setCenterY(min);
                self.autoSave("center",index,min);
                return false;
            }

            if(val > limit){
                setCenterY(limit);
                self.autoSave("center",index,limit);
                return true;
            }

            setCenterY(val);
            self.autoSave("center",index,val);
        },
        changePositionX:(ev)=>{
            const val=parseInt(ev.target.value);
            const index=0,min=0;
            const limit=400;        //最大的X轴，需要计算

            if(isNaN(val) || val<min){
                setPosX(min);
                self.autoSave("position",index,min);
                return false;
            }

            if(val > limit){
                setPosX(limit);
                self.autoSave("position",index,limit);
                return true;
            }

            setPosX(val);
            self.autoSave("position",index,val);
        },
        changePositionY:(ev)=>{
            const val=parseInt(ev.target.value);
            const index=1,min=0;
            const limit=400;        //最大的X轴，需要计算
            if(isNaN(val) || val<min){
                setPosY(min);
                self.autoSave("position",index,min);
                return false;
            }

            if(val > limit){
                setPosY(limit);
                self.autoSave("position",index,limit);
                return true;
            }

            setPosY(val);
            self.autoSave("position",index,val);
        },
        changeRotation:(ev)=>{
            const val=parseInt(ev.target.value);
            console.log(val);
            const index=0,min=0;
            const limit=Math.PI*2;        //最大的X轴，需要计算

            if(isNaN(val) || val<min){
                setRotation(min);
                self.autoSave("rotation",index,min);
                return false;
            }

            if(val > limit){
                setRotation(limit);
                self.autoSave("rotation",index,limit);
                return true;
            }
            
            setRotation(val);
            self.autoSave("rotation",index,val);
        },

        //TODO,这里来计算part的位置
        getPositionLimit:()=>{

        },
        

        setValues:(dt)=>{
            setValueStart(dt.value[0]);
            setValueStep(dt.value[1]);
            setValueDivide(dt.value[2]);
            setValueOffset(dt.value[3]);
            
            setImageLine(dt.img[0]);
            setImageRow(dt.img[1]);
            setImageEx(dt.img[2]);
            setImageEy(dt.img[3]);

            setCenterX(dt.center[0]);
            setCenterY(dt.center[1]);

            setPosX(dt.position[0]);
            setPosY(dt.position[1]);

            setRotation(dt.rotation[0]);
        },
    }
    
    useEffect(() => {
        const active=Data.get("selected");
        const def=Data.get("NFT");
        if(active===null || def===null || def.puzzle===undefined) return setHidden(true);
        const dt=def.puzzle[active];
        if(dt===undefined) return setHidden(true);
        
        setHidden(false);
        self.setValues(dt);
        setRare(<Rarity fresh={props.fresh} update={props.update} index={active}/>);

    }, [props.update]);

    return (
        <Row hidden={hidden} className="pt-2">
            {/* <Col lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
                <small className="text-warning">Raw: {raw}, value:{num}, order: {order}</small>
                <hr />
            </Col> */}
            <Col lg={size.value[0]} xl={size.value[0]} xxl={size.value[0]}>
                <small>Start</small>
                <input type="number" className="form-control" value={value_start} onChange={(ev)=>{
                    self.changeValueStart(ev);
                }}/>
            </Col>
            <Col lg={size.value[1]} xl={size.value[1]} xxl={size.value[1]}>
                <small>Step</small>
                <input type="number" className="form-control" value={value_step} onChange={(ev)=>{
                    self.changeValueStep(ev);
                }}/>
            </Col>
            <Col lg={size.value[2]} xl={size.value[2]} xxl={size.value[2]}>
                <small>Divide</small>
                <input type="number" className="form-control" value={value_divide} onChange={(ev)=>{
                    self.changeValueDivide(ev);
                }}/>
            </Col>
            <Col lg={size.value[3]} xl={size.value[3]} xxl={size.value[3]}>
                <small>Offset</small>
                <input type="number" className="form-control" value={value_offset} onChange={(ev)=>{
                    self.changeValueOffset(ev);
                }}/>
            </Col>
            {/* <Col lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
                <hr />
            </Col> */}
            <Col lg={size.img[0]} xl={size.img[0]} xxl={size.img[0]}>
                <small>Line X</small>
                <input type="number" className="form-control" value={img_line} onChange={(ev)=>{
                    self.changeImageLine(ev);
                }}/>
            </Col>
            <Col lg={size.img[1]} xl={size.img[1]} xxl={size.img[1]}>
                <small>Row Y</small>
                <input type="number" className="form-control" value={img_row} onChange={(ev)=>{
                    self.changeImageRow(ev);
                }}/>
            </Col>
            <Col lg={size.img[2]} xl={size.img[2]} xxl={size.img[2]}>
                <small>X extend</small>
                <input type="number" className="form-control" value={img_ext_x} onChange={(ev)=>{
                    self.changeImageEX(ev);
                }}/>
            </Col>
            <Col lg={size.img[3]} xl={size.img[3]} xxl={size.img[3]}>
                <small>Y extend</small>
                <input type="number" className="form-control" value={img_ext_y} onChange={(ev)=>{
                    self.changeImageEY(ev);
                }}/>
            </Col>
            {/* <Col lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
                <hr />
            </Col> */}
            <Col lg={size.center[0]} xl={size.center[0]} xxl={size.center[0]}>
                <small>Center X</small>
                <input type="number" step="0.1" className="form-control" value={center_x} onChange={(ev)=>{
                    self.changeCenterX(ev);
                }}/>
            </Col>
            <Col lg={size.center[1]} xl={size.center[1]} xxl={size.center[1]}>
                <small>Center Y</small>
                <input type="number" step="0.1" className="form-control" value={center_y} onChange={(ev)=>{
                    self.changeCenterY(ev);
                }}/>
            </Col>
            {/* <Col lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
                <hr />
            </Col> */}
            <Col lg={size.center[0]} xl={size.center[0]} xxl={size.center[0]}>
                <small>Pos X</small>
                <input type="number" className="form-control" value={pos_x} onChange={(ev)=>{
                    self.changePositionX(ev);
                }}/>
            </Col>
            <Col lg={size.center[0]} xl={size.center[0]} xxl={size.center[0]}>
                <small>Pos Y</small>
                <input type="number" className="form-control" value={pos_y} onChange={(ev)=>{
                    self.changePositionY(ev);
                }}/>
            </Col>
            <Col hidden={true} lg={size.rotation[0]} xl={size.rotation[0]} xxl={size.rotation[0]}>
                <small>Rotation</small>
                <input type="number" disabled={true}  step="0.1" className="form-control" value={rotation} onChange={(ev)=>{
                    self.changeRotation(ev);
                }}/>
            </Col>
            <Col lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
                {rare}
            </Col>
        </Row>
    )
}

export default Detail;