// DGPTBackground.jsx
import React from 'react';
import styled from 'styled-components';
import CognideXLogo from '../../assets/logo/cognidex-logo.svg';
import Footer from '../footer/Footer';

// Styled component for the background container
const Background = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000; /* Change to desired background color */
  overflow: hidden;
  z-index: -1; /* Ensure it stays behind other content */
`;

// Styled component for each logo instance
const LogoInstance = styled.img`
  position: absolute;
  top: ${({ top }) => top}%;
  left: ${({ left }) => left}%;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  opacity: ${({ opacity }) => opacity};
  transform: translate(-50%, -50%) rotate(${({ rotate }) => rotate}deg);
  pointer-events: none; /* Allows clicks to pass through */
`;

const ChildrenContainer = styled.div`
  position: relative;
  z-index: 1;
  width: 100vw;
  height: auto;
  min-height: 100vh;
`;

const DGPTBackground = ({ children }) => {
    const logo = CognideXLogo;

    // Fixed positions for aesthetic arrangement
    const positions = [
        { top: 10, left: 15, size: 100, opacity: 0.1, rotate: 15 },
        { top: 25, left: 30, size: 150, opacity: 0.12, rotate: -10 },
        { top: 40, left: 50, size: 200, opacity: 0.08, rotate: 45 },
        { top: 60, left: 75, size: 120, opacity: 0.15, rotate: -25 },
        { top: 75, left: 25, size: 250, opacity: 0.18, rotate: 65 },
        { top: 85, left: 60, size: 200, opacity: 0.1, rotate: 30 },
        { top: 35, left: 85, size: 90, opacity: 0.13, rotate: -35 },
        { top: 55, left: 40, size: 100, opacity: 0.2, rotate: 60 },
        { top: 15, left: 70, size: 110, opacity: 0.12, rotate: -45 },
        { top: 5, left: 45, size: 130, opacity: 0.09, rotate: 20 },
        { top: 70, left: 10, size: 180, opacity: 0.15, rotate: -15 },
        { top: 45, left: 95, size: 150, opacity: 0.1, rotate: 75 },
        { top: 80, left: 85, size: 150, opacity: 0.2, rotate: 125 },
        { top: 40, left: 15, size: 120, opacity: 0.18, rotate: -40 },
    ];

    const logos = positions.map(({ top, left, size, opacity, rotate }, index) => (
        <LogoInstance
            src={logo}
            alt="Monogram Logo"
            top={top}
            left={left}
            size={size}
            opacity={opacity}
            rotate={rotate}
            key={index}
        />
    ));

    return (
        <div>
            <Background>
                {logos}
            </Background>
            <ChildrenContainer>
                {children}
            </ChildrenContainer>
            <Footer />
        </div>
    );
};

export default DGPTBackground;
