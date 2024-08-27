import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

function Networks(props) {
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
                Network Selector
            </Col>
        </Row>
    )
}

export default Networks;