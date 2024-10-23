import React from 'react'
import styled from 'styled-components'

// Essentially the Hero section
const Container = styled.div`
    height: calc(90vh - 90px);
    width: 90vw;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    padding: 10vh 5vw 0 5vw;
    gap: 20px;

    h1 {
        font-size: 4rem;
    }

    @media (max-width: 1000px) {
        height: auto;
        width: 90vw;
        padding: calc(10vh + 70px) 5vw 20px 5vw;
    }

    .card-container {
        display: flex;
        width: 90vw;
        flex-direction: row;
        gap: 10px;
        min-height: 100px;
        justify-content: flex-start;

        @media (max-width: 1000px) {
            flex-direction: column;
            width: 90vw;
        }
    }

    .upload-container {
        display: flex;
        min-height: 100px;
        width: 90vw;
        justify-content: flex-start;

        @media (max-width: 1000px) {
            width: 95vw;
        }
    }

    .button-container {
        display: flex;
        width: 90vw;
        justify-content: flex-end;

        @media (max-width: 1000px) {
            width: 90vw;
        }
    }
`;

const ContributeSection = ({ children }) => {
    return (
        <Container>
            {children}
        </Container>
    )
}

export default ContributeSection
