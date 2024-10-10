import React from 'react'
import styled from 'styled-components'

const Background = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: black;
`;

const GradientCircle = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, white 0%, rgba(0, 0, 0, 1) 35%);
    // transform: translate(-50%, -50%);
`;

const ChildrenContainer = styled.div`
    position: relative;
    z-index: 1;
    width: 100%;
    height: auto;
    min-height: 200vh; 
`;

const MainBackground = ({ children }) => {
    return (
        <Background>
            <GradientCircle />
            <ChildrenContainer>
                {children}
            </ChildrenContainer>
        </Background>
    )
}

export default MainBackground
