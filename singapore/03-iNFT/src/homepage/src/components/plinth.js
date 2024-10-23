import { Container, Row, Col } from 'react-bootstrap';

function Plinth(props) {
  const subject = props.subject;
  const list = props.list;

  const cmap = {
    background: `url("${subject.background}") no-repeat center center`,
    'backgroundSize': 'cover',
    'minHeight': '600px',
  };
  const cols = {
    left: 3,
    mid: 4,
    right: 5,
  }

  return (
    <div expand="lg" className="bg-body-tertiary pt-4" id="plinth" style={cmap}>
      <Container>
        <Row className='pt-4'>
          <Col md={cols.right} lg={cols.right} xl={cols.right} xxl={cols.right} className='pt-4'>
            {list.map((item, key) => (
              <div key={key}>
                <h4 >{item.title}</h4>
                <p>{item.sub}</p>
              </div>
            ))}
          </Col>
          <Col md={cols.mid} lg={cols.mid} xl={cols.mid} xxl={cols.mid} className='pt-4'></Col>
          <Col md={cols.left} lg={cols.left} xl={cols.left} xxl={cols.left} className='pt-4'>
            <h3>{subject.title}</h3>
            <p>{subject.desc}</p>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
export default Plinth;