import { Carousel } from 'react-bootstrap';

function Slide(props) {
  return (
    <Carousel id="slide">
      {props.list.map((item, key) => (
        <Carousel.Item key={key}>
          <img
            className="d-block w-100"
            src={item.thumb}
            alt="First slide"
          />
          <Carousel.Caption>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </Carousel.Caption>
        </Carousel.Item>
      ))}
    </Carousel>
  );
}
export default Slide;