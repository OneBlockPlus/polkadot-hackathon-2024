import { Container, Row, Col, Card } from 'react-bootstrap';

function Loader(props) {
  const subject = props.subject;
  const frontend = props.frontend;
  const backend = props.backend;

  return (
    <Container>
      <Row id="intro_protocol">
        <Col md={5} lg={5} xl={5} xxl={5} className='pt-4'>
          {subject.desc.map((item, key) => (
            <p key={key}>{item}</p>
          ))}
        </Col>
        <Col md={7} lg={7} xl={7} xxl={7} className='pt-4'>
          <Card>
            <Card.Img variant="top" src={subject.background} />
          </Card>
        </Col>
      </Row>
      <Row className='pb-4'>
        <Col md={6} lg={6} xl={6} xxl={6} className='pt-4'>
          <Card>
            <Card.Body>
              <Card.Title>{frontend.title}</Card.Title>
              <Card.Text>{frontend.desc}</Card.Text>
              <section id="code_shell">{frontend.code}</section>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={6} xl={6} xxl={6} className='pt-4'>
          <Card>
            <Card.Body>
              <Card.Title>{backend.title}</Card.Title>
              <Card.Text>{backend.desc}</Card.Text>
              <section id="code_node">{backend.code}</section>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
export default Loader;