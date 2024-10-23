import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

import Render from "../lib/render";
import TPL from "../lib/tpl";

/* template section with mask support
*   @param  {string}    template        //CID of showing template
*   @param  {string}    index           //template parts index
*   @param  {string}    [selected]      //selected cell of section
*   @param  {boolean}   [only]          //image showing only
*/

function PartSection(props) {
    const size = {
        row: [12],
    };  

    let [width, setWidth]=useState(400);
    let [height, setHeight]=useState(50);
    let [bs64, setBS64] = useState("image/section.png");

    let [grid, setGrid]=useState([]);

    const cut_id = "pre_cut";
    const self = {
        showSection:(index,cid)=>{
            if(!cid){
                const def=TPL.current();
                if(!def) return setTimeout(()=>{
                    self.showSection(index);
                },500);
                self.render(def,index);
            }else{
                TPL.view(cid,(def)=>{
                    if(!def) return setTimeout(()=>{
                        self.showSection(index);
                    },500);
                    self.render(def,index);
                });
            }
        },
        render:(def,index)=>{
            const target=def.parts[index];
            const w = def.cell[0], h = def.cell[1];
            const [start, step, divide, offset] = target.value;
            const [gX, gY, eX, eY] = target.img;
            const [line, row] = def.grid;
            const max = line / (1 + eX);
            const br = Math.ceil((gX + divide) / max);
            
            //1.calc the section size;
            const s_w=def.grid[0]*w;        //section width;
            const s_h=h*(1+eY)*br;          //section height;
            setWidth(s_w);
            setHeight(s_h);

            //2.cut the section from orgin image
            Render.drop(cut_id);
            const cpen = Render.create(cut_id);
            if(cpen===false) return false;
            Render.cut(cpen, def.image, w, h, gY, line, (1 + eY) * br, (img_section) => {
                setBS64(img_section);
                const cfg={
                    width:w*(1+eX),         //selected cell width
                    height:h*(1+eY),        //selected cell height
                    offset:gX,              //first cell offset amount
                    line:max,              //amount per line
                }
                if(!props.only)self.showCover(divide,props.selected,cfg)
            });
        },
        showCover:(n,selected,cfg)=>{
            //console.log(cfg);
            let arr=[]
            for(let i=0;i<n;i++){
                arr.push({
                    wX:cfg.width,         //mask width, w*(1+eX)
                    wY:cfg.height,         //mask height
                    mX:((i+cfg.offset)%cfg.line)*cfg.width,                 //calc the row break
                    mY:Math.floor((i+cfg.offset)/cfg.line)*cfg.height,      //calc the row break
                    active:i===selected
                })
            }
            setGrid(arr);
        },
    }

    useEffect(() => {
        self.showSection(props.index,props.template);
    }, [props.index,props.selected]);

    return (
        <Row className="unselect pt-2 pb-2">
            <canvas hidden={true} id={cut_id} width={width} height={height}></canvas>
            <Col className="pt-1" sm={size.row[0]} xs={size.row[0]}>    
                {grid.map((row, order) => (
                    <div className="cover" key={order} style={{
                        marginLeft: `${row.mX}px`,
                        marginTop: `${row.mY}px`,
                        width: `${row.wX}px`,
                        height: `${row.wY}px`,
                        lineHeight: `${row.wY}px`,
                        backgroundColor:`${row.active?"#f7cece":"#4aab67"}` ,
                        color: `${row.active?"#ff0000":"#ffffff"}`,
                    }}>{order}</div>
                ))}
                <img src={bs64} width={width} height={height} alt="The target section of orgin template"/>
            </Col>
        </Row>
    )
}

export default PartSection;