import { Row, Col } from "react-bootstrap";

function InvalidPage(props) {

    const size = {
        row: [12],
        flow: [3, 6, 3]
    };

    return (
        <Row className="pt-2">
            <Col className="text-center" sm={size.flow[0]} xs={size.flow[0]}>
                404 Error.
            </Col>
        </Row>
    )
}

export default InvalidPage;