import React from 'react';
import styled, { keyframes } from 'styled-components';

const Background = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    z-index: -1;
    width: 100%;
    height: 100%;
    overflow: hidden;
`;

const moveLine = angle => keyframes`
  from {
    transform: translateY(100vh) rotate(${angle}deg);
  }
  to {
    transform: translateY(-100vh) rotate(${angle}deg);
  }
`;

const Line = styled.div`
  position: absolute;
  width: 1px;
  height: 200vh;
  background: rgba(255, 255, 255, 0.1);
  left: ${props => props.left}%;
  top: -100vh;
  transform: rotate(${props => props.angle}deg);
  animation: ${props => moveLine(props.angle)} ${props => props.duration}s linear infinite;
`;

const ChildrenContainer = styled.div`
    position: relative;
    z-index: 1;
    width: 100vw;
    height: auto;
    min-height: 100vh;
`;


const DataPoolContributeBg = ({ children }) => {
    const lines = Array.from({ length: 50 }, (_, i) => {
        const left = Math.random() * 100;
        const duration = 10 + Math.random() * 20;
        const angle = -30 + Math.random() * 60; // Random angle between -30 and +30 degrees
        return <Line left={left} duration={duration} angle={angle} key={i} />;
    });

    return (
        <div>
            <Background>
                {lines}
            </Background>
            <ChildrenContainer>
                {children}
            </ChildrenContainer>
        </div>
    );
};

export default DataPoolContributeBg;
