import { Container, Row, Col } from 'react-bootstrap';

function Footer() {
  return (
    <div expand="lg" className="bg-body-tertiary" id="footer_nav">
      <Container>
        <Row>
          <Col md={3} lg={3} xl={3} xxl={3} className='pt-4'>
            <h2>iNFT</h2>
          </Col>
          <Col md={3} lg={3} xl={3} xxl={3} className='pt-4'>

          </Col>
          <Col md={6} lg={6} xl={6} xxl={6} className='pt-4 text-end'>
            <h4 className='pt-1'>© 2024 Pirate DAO</h4>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
export default Footer;