import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

function PartTarget(props) {
    const size = {
        row: [12],
    };

    let [bs64, setBS64] = useState("image/empty.png");
    const self = {

    }

    useEffect(() => {

    }, []);

    return (
        <img src={bs64} style={{width:"100%"}} alt="The target part of orgin template"/>
    )
}

export default PartTarget;