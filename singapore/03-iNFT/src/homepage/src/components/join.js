import { Container, Row, Col } from 'react-bootstrap';

function Join() {
  return (
    <div expand="lg" className="bg-body-tertiary pt-4" id="join_us">
      <Container>
        <Row>
          <Col md={4} lg={4} xl={4} xxl={4} className='pt-4'>
            <h3>Join Us</h3>
          </Col>
          <Col md={8} lg={8} xl={8} xxl={8} className='pt-4'></Col>
        </Row>
      </Container>
    </div>
  );
}
export default Join;