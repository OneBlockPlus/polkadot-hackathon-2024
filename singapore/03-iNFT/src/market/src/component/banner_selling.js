import { Container, Row, Col } from "react-bootstrap";

function BannerSelling(props) {
  const size = {
    row: [12],
  };
  const cmap = {
    //background: `url("${subject.background}") no-repeat center center`,
    "backgroundSize": "cover",
    "minHeight": "300px",
  };

  return (
    <div expand="lg" className="bg-body-tertiary pt-4 pb-4" id="banner_selling" style={cmap}>
      <Container>
        <Row className="pt-4">
          <Col className="pt-4" md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
            Introduction about iNFT, especial the price.
          </Col>
        </Row>
      </Container>
    </div>
  );
}
export default BannerSelling;