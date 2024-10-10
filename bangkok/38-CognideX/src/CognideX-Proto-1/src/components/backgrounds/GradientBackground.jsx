import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const GradientContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const GradientCircle = styled.div`
  position: absolute;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, white 0%, rgba(0, 0, 0, 0) 35%);
  transform: translate(${(props) => props.x}%, ${(props) => props.y}%);
  transition: transform 0.5s ease-out;
`;

const ChildrenContainer = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  height: auto;
  min-height: 200vh; 
`;

const GradientBg = ({ children }) => {
  const [gradientPosition, setGradientPosition] = useState({ x: 0, y: -50 });

  useEffect(() => {
    const targetSM = document.getElementById('smart-assistant');
    const targetDP = document.getElementById('data-pool');
    const targetCGDX = document.getElementById('cgdx');

    const targets = [targetSM, targetDP, targetCGDX].filter(Boolean);
    if (targets.length === 0) return;

    const observerOptions = {
      root: null, // Use the viewport as the container
      rootMargin: '0px',
      threshold: 0.5, // Trigger when at least 40% of the element is visible
    };

    // Variables to track the intersection status of each element
    let isDataPoolIntersecting = false;
    let isSmartAssistantIntersecting = false;
    let isCGDXIntersecting = false;

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        const isIntersecting = entry.isIntersecting;

        if (entry.target.id === 'data-pool') {
          isDataPoolIntersecting = isIntersecting;
        } else if (entry.target.id === 'smart-assistant') {
          isSmartAssistantIntersecting = isIntersecting;
        } else if (entry.target.id === 'cgdx') {
          isCGDXIntersecting = isIntersecting;
        }

        // Update gradient position based on which element is intersecting
        if (isDataPoolIntersecting) {
          // If 'data-pool' is intersecting, move gradient to the middle
          setGradientPosition({ x: -25, y: -25 });
        } else if (isSmartAssistantIntersecting) {
          // If 'smart-assistant' is intersecting, move gradient to another position
          setGradientPosition({ x: -50, y: -25 });
        } else if (isCGDXIntersecting) {
          // If 'cgdx' is intersecting, move gradient to another position
          setGradientPosition({ x: -25, y: 5 });
        } else {
          // If neither is intersecting, reset gradient position
          setGradientPosition({ x: 0, y: -50 });
        }
      });
    };
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    targets.forEach((target) => observer.observe(target));

    // Cleanup on component unmount
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <GradientContainer>
        <GradientCircle x={gradientPosition.x} y={gradientPosition.y} />
      </GradientContainer>
      <ChildrenContainer>{children}</ChildrenContainer>
    </>
  );
};

export default GradientBg;
