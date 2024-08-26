import { Container, Row, Col, Card } from 'react-bootstrap';

function Points(props) {
  return (
    <Container id="anchor">
      <Row className='pb-4'>
        {props.list.map((item, key) => (
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
export default Points;