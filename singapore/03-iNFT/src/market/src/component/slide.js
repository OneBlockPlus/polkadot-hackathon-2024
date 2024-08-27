import { Row, Col, Carousel } from "react-bootstrap";

import { useEffect, useState } from "react";
function Slide(props) {
  let [list, setList]=useState([]);

  useEffect(() => {
    const slides=[
      {
        title:"Hot Flamingo",
        desc:"Mascot of W3OS version 2024.",
        thumb:"imgs/Banner_01.jpg",
        alt:"",
      },
      {
        title:"Walking Hermit Crab",
        desc:"MEKK Carton",
        thumb:"imgs/Banner_01.jpg",
        alt:"",
      },
      {
        title:"Smiling Donkey.",
        desc:"Teeth of Donkey.",
        thumb:"imgs/Banner_01.jpg",
        alt:"",
      },
    ]
    setList(slides);
}, [  ]);

  return (
    <Carousel id="slide">
      {list.map((item, key) => (
        <Carousel.Item key={key}>
          <img
            className="d-block w-100"
            src={item.thumb}
            alt={item.alt}
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