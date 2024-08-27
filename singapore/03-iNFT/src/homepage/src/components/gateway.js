import { Container, Row, Col } from 'react-bootstrap';

function Gateway(props) {
  const subject = props.subject;

  const cmap={
    background:`url("${subject.background}") no-repeat center center`,
    'backgroundSize': 'cover',
    'minHeight':'600px',
  };
  return (
    <div expand="lg" className="bg-body-tertiary pt-4" id="gateway" style={cmap}>
      <Container>
        <Row>
          <Col md={8} lg={8} xl={8} xxl={8} className='pt-4'>
            <h3>{subject.title}</h3>
            {subject.details.map((item, key) => (
              <p key={key}>{item}</p>
            ))}
          </Col>
          <Col md={4} lg={4} xl={4} xxl={4} className='pt-4'></Col>
        </Row>
      </Container>
    </div>
  );
}
export default Gateway;