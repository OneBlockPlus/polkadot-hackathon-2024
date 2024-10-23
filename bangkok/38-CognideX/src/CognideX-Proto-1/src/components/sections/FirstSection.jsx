import React from 'react'
import styled from 'styled-components'

// Essentially the Hero section
const Container = styled.div`
    position: relative;
    height: 90vh;
    width: 90vw;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    padding: 10vh 5vw 0 5vw;
    gap: 20px;

    .button-container {
        display: flex;
        flex-direction: row;
        gap: 12px;
        min-height: 100px;
        justify-content: flex-start;
    }

    .logo-container {
        position: absolute;
        top: 50vh;
        width: 50vw;
        transform: translateY(-50%);
        right: 0;
        z-index: -1;

        img {
            width: 75vh;
            height: auto;
            transform: rotate(-45deg);
        }

        @media (max-width: 1000px) {
            opacity: 0.1;
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
