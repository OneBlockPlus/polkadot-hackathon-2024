// MainSlider.jsx
import React, { useState, Children, cloneElement } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const SliderContainer = styled.div`
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
`;

const SliderTrack = styled.div`
  display: flex;
  transition: transform 0.5s ease-in-out;
  transform: ${({ currentSlide, slideWidth }) =>
        `translateX(-${currentSlide * slideWidth}%)`};
`;

const Slide = styled.div`
  flex: 0 0 ${({ slideWidth }) => slideWidth}%;
  box-sizing: border-box;
  padding: 10px;
`;

const NavButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  border: none;
  padding: 10px;
  cursor: pointer;
  border-radius: 50%;
  z-index: 1;
  ${({ direction }) =>
        direction === 'prev' ? 'left: 10px;' : 'right: 10px;'}
  &:disabled {
    background-color: rgba(0, 0, 0, 0.2);
    cursor: not-allowed;
  }
`;

const DotsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 10px;
`;

const Dot = styled.span`
  height: 10px;
  width: 10px;
  margin: 0 5px;
  background-color: ${({ active }) => (active ? '#333' : '#bbb')};
  border-radius: 50%;
  display: inline-block;
  cursor: pointer;
`;

const MainSlider = ({ children, slideWidth = 100 }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const totalSlides = Children.count(children);

    const handlePrev = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    const handleNext = () => {
        if (currentSlide < totalSlides - 1) {
            setCurrentSlide(currentSlide + 1);
        }
    };

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    return (
        <>
            <SliderContainer>
                <NavButton
                    onClick={handlePrev}
                    disabled={currentSlide === 0}
                    direction="prev"
                >
                    &#10094;
                </NavButton>
                <SliderTrack currentSlide={currentSlide} slideWidth={slideWidth}>
                    {Children.map(children, (child, index) => (
                        <Slide key={index} slideWidth={slideWidth}>
                            {cloneElement(child, { index })}
                        </Slide>
                    ))}
                </SliderTrack>
                <NavButton
                    onClick={handleNext}
                    disabled={currentSlide === totalSlides - 1}
                    direction="next"
                >
                    &#10095;
                </NavButton>
            </SliderContainer>
            <DotsContainer>
                {Array.from({ length: totalSlides }).map((_, index) => (
                    <Dot
                        key={index}
                        active={index === currentSlide}
                        onClick={() => goToSlide(index)}
                    />
                ))}
            </DotsContainer>
        </>
    );
};

MainSlider.propTypes = {
    children: PropTypes.node.isRequired,
    slideWidth: PropTypes.number, // Percentage width per slide
};

export default MainSlider;
