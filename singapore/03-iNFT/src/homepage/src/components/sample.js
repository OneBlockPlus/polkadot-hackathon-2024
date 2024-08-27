import { Container, Row, Col, Card } from 'react-bootstrap';

function Sample(props) {
  const desc = props.desc;
  const list = props.list;
  return (
    <Container>
      <Row id="intro_gateway">
        <Col md={12} lg={12} xl={12} xxl={12} className='pt-4'>
          {desc.map((item, key) => (
            <p key={key}>{item}</p>
          ))}
        </Col>
      </Row>
      <Row className='pb-4'>
        {list.map((item, key) => (
          <Col md={4} lg={4} xl={4} xxl={4} className='pt-4' key={key}>
            <Card>
              <Card.Img variant="top" src={item.thumb} />
              <Card.Body>
                <Card.Title>{item.title}</Card.Title>
                <Card.Text>{item.desc}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
export default Sample;