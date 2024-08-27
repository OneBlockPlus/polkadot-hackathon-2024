import { Row, Col } from "react-bootstrap";
import { useEffect, useState,useRef } from "react";

import  Data from "../lib/data";
import tools from "../lib/tools";

function Preview(props) {
    const size = {
        row: [12],
        grid: [6,6],
    };

    let [width,setWidth]=useState(0);
    let [height,setHeight]=useState(0);
    let [show,setShow]=useState(false);

    let [image,setImage]=useState("image/empty.png");
    let [grid, setGrid] =useState([]);
    let [active, setActive]=useState(null);

    const ref = useRef(null);

    const self={
        clickGrid:(index)=>{
            Data.set("grid",index);
            //console.log(index);
            self.updateHash(index,()=>{
                props.fresh();
            });
        },
        updateHash:(order,ck)=>{
            const puzzle_index=Data.get("selected");
            const NFT=Data.get("NFT");
            const hash=Data.get("hash");
            const def=NFT.puzzle[puzzle_index];
            console.log(def);
            const [hash_start,hash_step,divide,offset]=def.value;
            const [line_x,line_y,extend_x,extend_y]=def.img;
            Data.set("hash",self.getHash(hash,order,hash_start,hash_step,divide,offset,line_x));
            return ck && ck();
        },
        getHelper:(amount,line,w,h,gX,gY,eX,eY)=>{       //gX没用到，默认从0开始
            const list=[];
            const max=Math.floor(line/(1+eX));
            //console.log(max);
            for(let i=0;i<amount;i++){
                const br=Math.floor((gX+i)/max);
                list.push({
                    mX:w*(eX+1)*((gX+i)%max),    //margin的X值
                    mY:h*(gY+br*(1+eY)),        //margin的Y值
                    wX:w*(eX+1),                //block的width
                    wY:h*(eY+1),                //block的height
                });
            } 
            return list;
        },
        getBackground:(index)=>{
            const selected_grid=Data.get("grid");
            const ac="#4aab67";
            const sc="#f7cece";
            const bc="#99ce23";
            if(selected_grid===index){
                return sc;
            }else{
                return active===index?ac:bc
            }
        },
        getHash:(hash,order,start,step,divide,offset,line_x)=>{
            //console.log(line_x);
            const hex=16;
            const top=Math.pow(hex,step);    //总数据量
            const m=Math.floor(top/divide);  //根据divde获取的最大multi乘数
            const multi=tools.rand(0,m);

            //修正输出到指定的范围，写的很尴尬
            const rand_start=multi*divide;
            const nn= ((rand_start===0?divide:rand_start)+order-offset)+line_x;
            const n=nn>=hex?nn-hex:nn;

            //console.log(multi,order,rand_start,n);
            
            //2.拼接字符串
            const px=2;     //支付串"0x"前缀
            const prefix=hash.substring(0,start+px);
            const tailor=hash.substring(start+step+px,hash.length+px);
            return `${prefix}${tools.toHex(n,step)}${tailor}`;
        },
        autoFresh:(x,y,cellX,cellY)=>{
            //console.log(cellX,cellY);
            const width=ref.current.offsetWidth;
            const w=tools.toF(width/x,3);
            const rate=w/cellX;
            const h=cellY*rate;
            const bs64=Data.get("template");
            if(bs64!==null){
                setImage(bs64);
                tools.getImageSize(bs64,(w,h)=>{
                    setWidth(w);
                    setHeight(h);
                    setShow(true);
                });
                
                const puzzle_selected=Data.get("selected");
                const NFT=Data.get("NFT");
                //console.log(NFT);
                if(NFT!==null && puzzle_selected!==null){
                    const def=NFT.puzzle[puzzle_selected];
                    const hash=Data.get("hash");
                    
                    if(def.img){
                        const [hash_start,hash_step,amount,offset]=def.value;
                        const str="0x"+hash.substring(hash_start+2,hash_start+2+hash_step);
                        const rand=parseInt(str);
    
                        const sel=(rand+offset)%amount;
                        setActive(sel);
    
                        const [gX,gY,eX,eY]=def.img;
                        const gg=self.getHelper(amount,x,w,h,gX,gY,eX,eY);
                        setGrid(gg);
                        
                    }
                }
            }
        },
    }

    useEffect(() =>{
        const tpl=Data.get("template");
        if(tpl===null){
            setGrid([]);
            setShow(false);
            setImage("image/empty.png");
        }else{
            const ss=Data.get("size");
            self.autoFresh(ss.grid[0],ss.grid[1],ss.cell[0],ss.cell[1]);
        }
    }, [props.update,ref.current]);

    return (
        <Row>
            <Col className="pt-2" lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
                {grid.map((row, index) => (
                    <div className="cover" key={index} style={{
                            marginLeft:`${row.mX}px`,
                            marginTop:`${row.mY}px`,
                            width:`${row.wX}px`,
                            height:`${row.wY}px`,
                            lineHeight:`${row.wY}px`,
                            backgroundColor:self.getBackground(index),
                        }} 
                        onClick={(ev)=>{
                            self.clickGrid(index);
                        }}>{index}</div>
                ))}
                {<img id="preview" ref={ref} src={image} alt="Preview of full iNFT" />}
            </Col>
            <Col hidden={!show} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
                Size: {width}px * {height}px
            </Col>
        </Row>
    )
}

export default Preview;