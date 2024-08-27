import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

function Vertiy(props) {
    const size = {
        row: [12],
    };

    const self = {

    }
    useEffect(() => {

    }, [props.update]);

    return (
        <Row>
            <Col className="text-center" sm={size.row[0]} xs={size.row[0]}>
                <button className="btn btn-lg btn-primary" onClick={(ev) => {
                    self.clickVertify(ev);
                }}>Vertiy</button>
            </Col>
        </Row>
    )
}

export default Vertiy;