import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

function SmallHash(props) {
    const size = {
        row: [12],
    };

    const config={
        grid:!props.grid?8:props.grid,                //the amount of a row
        warning:"#ffc107",      //warning color
        default:"#666666"
    };

    let [list, setList]=useState([]);

    const self={
        toArray:(hash,step)=>{
            const len=hash.length;
            const page=Math.ceil(len/step);
            const data={
                section:[],
                color:[],
            }

            for(let i=0;i<page;i++){
                const start=i*step;
                const end=start+step;
                data.section.push(hash.slice(start,end));
                data.color.push(Array(step).fill(config.default));
            }
            return data;
        },
        group:(matrix)=>{
            const arr=[];
            for(let i=0;i<matrix.section.length;i++){
                arr.push({
                    data:matrix.section[i],
                    color:matrix.color[i],
                })
            }
            return arr;
        },  
        fresh:()=>{
            const pure= props.hash.slice(2);
            const matrix=self.toArray(pure,config.grid);
            let row=Math.floor(props.start/config.grid);
            let index=props.start%config.grid;

            for(let i=0;i<props.step;i++){
                matrix.color[row+Math.floor((index+i)/config.grid)][(index+i)%config.grid]=config.warning;
            } 
            const nlist=self.group(matrix);
            //console.log(props,nlist);
            setList(nlist)
        },
    }

    useEffect(() => {
        self.fresh();
    }, [props.hash,props.start,props.step]);

    return (
        <Row className="unselect pt-2">
            {list.map((row, index) => (
                <Col className="text-center hash_small" key={index} sm={size.row[0]} xs={size.row[0]}>
                    {row.color.map((cc, cindex) => (
                        <span key={cindex} style={{color:cc}}>{row.data[cindex]}</span>
                    ))}
                </Col>
            ))}
        </Row>
    )
}

export default SmallHash;