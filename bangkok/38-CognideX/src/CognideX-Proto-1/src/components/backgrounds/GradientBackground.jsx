import React, { useEffect, useState } from 'react';
import Footer from '../footer/Footer';
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
    const targetFooter = document.getElementById('footer');

    const targets = [targetSM, targetDP, targetCGDX, targetFooter].filter(Boolean);
    if (targets.length === 0) return;

    const observerOptions = {
      root: null, // Use the viewport as the container
      rootMargin: '0px',
      threshold: 0.6, // Trigger when at least 40% of the element is visible
    };

    let isDataPoolIntersecting = false;
    let isSmartAssistantIntersecting = false;
    let isCGDXIntersecting = false;
    let isFooterIntersecting = false;

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        const isIntersecting = entry.isIntersecting;

        if (entry.target.id === 'data-pool') {
          isDataPoolIntersecting = isIntersecting;
        } else if (entry.target.id === 'smart-assistant') {
          isSmartAssistantIntersecting = isIntersecting;
        } else if (entry.target.id === 'cgdx') {
          isCGDXIntersecting = isIntersecting;
        } else if (entry.target.id === 'footer') {
          isFooterIntersecting = isIntersecting;
          if (isFooterIntersecting) {
            window.addEventListener('scroll', handleFooterScroll);
          } else {
            window.removeEventListener('scroll', handleFooterScroll);
          }
        }

        if (isDataPoolIntersecting) {
          setGradientPosition({ x: -25, y: -25 });
        } else if (isSmartAssistantIntersecting) {
          setGradientPosition({ x: -50, y: -25 });
        } else if (isCGDXIntersecting) {
          setGradientPosition({ x: -25, y: -10 });
        } else if (isFooterIntersecting) {
          setGradientPosition({ x: -25, y: -25 });
        } else {
          setGradientPosition({ x: 0, y: -50 });
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    targets.forEach((target) => observer.observe(target));

    const handleFooterScroll = () => {
      console.log('Footer is in view, handling custom logic...');
      // Add any custom logic you want to handle when the footer is in view.
    };

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleFooterScroll);
    };
  }, []);

  return (
    <>
      <GradientContainer>
        <GradientCircle x={gradientPosition.x} y={gradientPosition.y} />
      </GradientContainer>
      <ChildrenContainer>{children}</ChildrenContainer>
      <Footer id="footer" />
    </>
  );
};

export default GradientBg;
