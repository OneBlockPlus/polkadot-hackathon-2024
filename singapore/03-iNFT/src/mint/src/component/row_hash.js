import { Col } from "react-bootstrap";

function RowHash(props) {
    const size = {
        row: [12],
    };
    //console.log(props);
    return (
        <Col className="hash" sm={size.row[0]} xs={size.row[0]}>
            {props.color.map((row, index) => (
                <span key={index} style={{color:row}}>{props.data[index]}</span>
            ))} 
        </Col>
    )
}

export default RowHash;