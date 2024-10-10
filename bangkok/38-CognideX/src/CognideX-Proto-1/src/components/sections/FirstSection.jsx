import React from 'react'
import styled from 'styled-components'

// Essentially the Hero section
const Container = styled.div`
    height: 85vh;
    width: 90vw;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    padding: 15vh 5vw 0 5vw;
    gap: 20px;

    .button-container {
        display: flex;
        flex-direction: row;
        gap: 20px;
        min-height: 100px;
        justify-content: flex-start;
    }

    .logo-container {
        position: absolute;
        top: 50vh;
        transform: translateY(-50%);
        right: -15%;

        img {
            width: 800px;
            height: auto;
            transform: rotate(-45deg);
        }
    }
`;

const FirstSection = ({ children }) => {
    return (
        <Container>
            {children}
        </Container>
    )
}

export default FirstSection
