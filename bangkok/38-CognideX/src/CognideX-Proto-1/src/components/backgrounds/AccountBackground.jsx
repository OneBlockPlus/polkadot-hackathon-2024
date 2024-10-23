import React from 'react'
import styled from 'styled-components'
import Footer from '../footer/Footer';

const Background = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  background: black;
`;

const GradientCircle = styled.div`
    position: absolute;
    width: 270%;
    height: 200%;
    background: radial-gradient(circle, white 0%, rgba(0, 0, 0, 0) 35%);
    transform: translate(-32%, -60%);
`;

const ChildrenContainer = styled.div`
    position: relative;
    z-index: 1;
    width: 100%;
    height: auto;
    min-height: 100vh; 
`;

const AccountBackground = ({ children }) => {
    return (
        <Background>
            <GradientCircle />
            <ChildrenContainer>
                {children}
            </ChildrenContainer>
            <Footer />
        </Background>
    )
}

export default AccountBackground
