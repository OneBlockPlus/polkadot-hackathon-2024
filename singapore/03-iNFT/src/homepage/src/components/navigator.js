import { Container, Row, Col, Nav, Navbar } from 'react-bootstrap';

function Navigator() {
  const size={
    row:[6,6]
  }
  return (
    <Navbar expand="lg" className="bg-body-tertiary">

      <Container>
        <Navbar.Brand href="/home">
              <strong>iNFT</strong>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav" >
            <Row style={{width:"100%"}}>
          <Col lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
          <Nav className="me-auto">
                <Nav.Link href="/home">Home</Nav.Link>
                <Nav.Link href="/market">Market</Nav.Link>
                <Nav.Link href="/minter">Minter</Nav.Link>
                <Nav.Link href="/editor">Editor</Nav.Link>
              </Nav>
          </Col>
          <Col className='text-end pt-2' lg={size.row[1]} xl={size.row[1]} xxl={size.row[1]}>
              <button>Telegram</button>
              <button>Twitter</button>
              <button>Discord</button>
          </Col>
        </Row>
              
            </Navbar.Collapse>
        
      </Container>
    </Navbar>
  );
}

export default Navigator;