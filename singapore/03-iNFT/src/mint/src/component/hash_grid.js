import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

function GridHash(props) {
    const size = {
        row: [12],
    };

    let [grid, setGrid] = useState([]);
    const self = {
        getHashGrid:(str,divide)=>{
            const pure=str.slice(2);
            const n=Math.ceil(pure.length/divide);
            //console.log(pure,n);
            const arr=[];
            for(let i=0;i<n;i++){
                arr.push(pure.slice(i*divide,i*divide+divide))
            }
            return arr;
        },
    }

    useEffect(() => {
        const hash=props.hash;
        const divide=props.grid;
        const arr=self.getHashGrid(hash,divide);
        setGrid(arr);
    }, [props.hash,props.grid]);

    return (
        <Row className="unselect pt-2">
            <Col className="text-center pt-1" sm={size.row[0]} xs={size.row[0]}>
                {grid.map((row, index) => (
                    <p className="hash_setting" key={index}>{row}</p>
                ))}
            </Col>
        </Row>
    )
}

export default GridHash;