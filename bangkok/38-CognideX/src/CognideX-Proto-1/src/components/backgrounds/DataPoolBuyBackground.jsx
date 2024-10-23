// DataPoolBuyBackground.jsx
import React from 'react';
import styled from 'styled-components';
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

const ChildrenContainer = styled.div`
  position: relative;
  z-index: 1;
  width: 100vw;
  height: auto;
  min-height: 100vh;
`;

const DataPoolBuyBackground = ({ children }) => {
    return (
        <div>
            <Background>
                {/* {logos} */}
            </Background>
            <ChildrenContainer>
                {children}
            </ChildrenContainer>
            <Footer />
        </div>
    );
};

export default DataPoolBuyBackground;
