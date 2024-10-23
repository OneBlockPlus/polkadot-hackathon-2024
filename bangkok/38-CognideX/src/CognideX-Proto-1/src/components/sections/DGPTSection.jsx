import React from 'react'
import styled from 'styled-components'

// Essentially the Hero section
const Container = styled.div`
    height: calc(100vh - 130px);
    width: 90vw;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: flex-start;
    padding: calc(10vh + 90px) 5vw 20px 5vw;
    gap: 30px;

    @media (max-width: 1000px) {
        height: calc(90vh - 90px);
        width: 95vw;
        padding: calc(10vh + 70px) 2.5vw 20px 2.5vw;
    }

    .chat-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 50vw;

        @media (max-width: 1000px) {
            width: calc(95vw - 20px);
        }
    }

    .feature-container {
        display: flex;
        flex-direction: column;
        height: calc(100%);
        flex: 1;
        gap: 10px;
        padding: 0 0 0 0;

        @media (max-width: 1000px) {
            display: none;
        }

        .feature-text {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }

        .feature-card-container {
            display: flex;
            flex: 1;
            flex-direction: column;
            gap: 12px;
        }
    }
`;

const DGPTSection = ({ children }) => {
    return (
        <Container>
            {children}
        </Container>
    )
}

export default DGPTSection
