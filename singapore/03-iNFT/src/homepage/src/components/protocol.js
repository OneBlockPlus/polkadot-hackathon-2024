import { Container, Row, Col, Nav } from 'react-bootstrap';


function Protocol(props) {
  const subject = props.subject;
  const list = props.list;

  const cmap = {
    background: `url("${subject.background}") no-repeat center center`,
    'backgroundSize': 'cover',
    'minHeight': '600px',
  };

  return (
    <div expand="lg" className="bg-body-tertiary pt-4" id="protocol" style={cmap}>
      <Container>
        <Row>
          <Col md={7} lg={7} xl={7} xxl={7} className='pt-4'>
            <h3>{subject.title}</h3>
            <p>{subject.desc}</p>
          </Col>
          <Col md={5} lg={5} xl={5} xxl={5} className='pt-4'>
            {list.map((item, key) => (
              <div key={key}>
                <h4 >{item.title}</h4>
                <p>{item.sub}</p>
              </div>
            ))}
          </Col>
        </Row>
      </Container>
    </div>
  );
}
export default Protocol;