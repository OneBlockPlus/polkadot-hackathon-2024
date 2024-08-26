import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";

let font=14;

function Mine(props) {
    const size = {
        row: [12],
        flow:[3,6,3]
    };

    const self={

    }

    useEffect(() => {
        // setInterval(()=>{
        //     font += 0.1;
        //     setCmap([{fontSize:font},{fontSize:font},{fontSize:font}]);
        // },100)
    }, [props.update]);

    return (
        <Row className="pt-2">
            <Col className="text-center" sm={size.flow[0]} xs={size.flow[0]}>
                Mine page
            </Col>
        </Row>
    )
}

export default Mine;